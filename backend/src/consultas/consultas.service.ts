import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SeccionModel } from '../models/seccion.model';
import { SubfondoModel } from '../models/subfondo.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SolicitudConsultaModel } from '../models/solicitud-consulta.model';
import { SolicitudConsultaExpedienteModel } from '../models/solicitud-consulta-expediente.model';
import { SUsuario } from '../models/s-usuario.model';

const EXPEDIENTE_CLASIFICACION_INCLUDE = [
  {
    model: SerieModel,
    include: [{ model: SeccionModel, include: [{ model: SubfondoModel }] }],
  },
  {
    model: SubSerieModel,
    include: [{ model: SerieModel, include: [{ model: SeccionModel, include: [{ model: SubfondoModel }] }] }],
  },
];

@Injectable()
export class ConsultasService {
  constructor(
    @InjectModel(ResponsableArchivoModel) private responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(SerieModel) private serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel) private subSerieModel: typeof SubSerieModel,
    @InjectModel(ExpedienteSerieSubseModel) private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(SolicitudConsultaModel) private solicitudModel: typeof SolicitudConsultaModel,
    @InjectModel(SolicitudConsultaExpedienteModel) private solicitudExpedienteModel: typeof SolicitudConsultaExpedienteModel,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
  ) {}

  private async getDeptIds(rfc: string): Promise<number[]> {
    const responsables = await this.responsableModel.findAll({
      where: { rfc_responsable: rfc, status: true },
      attributes: ['id_Departamento'],
    });
    return responsables.map((r) => r.get('id_Departamento') as number);
  }

  private async getExpedienteIdsDeptos(deptIds: number[]): Promise<number[]> {
    if (!deptIds.length) return [];
    const serieIds = (await this.serieModel.findAll({
      where: { departamento_id: { [Op.in]: deptIds } },
      attributes: ['id'],
    })).map((s) => s.id);
    const subserieIds = (await this.subSerieModel.findAll({
      where: { id_Departamento: { [Op.in]: deptIds } },
      attributes: ['id'],
    })).map((s) => s.id);

    const expedientes = await this.expedienteModel.findAll({
      where: {
        [Op.or]: [
          { id_serie: { [Op.in]: serieIds } },
          { id_subserie: { [Op.in]: subserieIds } },
        ],
      },
      attributes: ['id'],
    });
    return expedientes.map((e) => e.id);
  }

  private async resolveNombres(rfcs: (string | null | undefined)[]): Promise<Map<string, string>> {
    const unicos = [...new Set(rfcs.filter((r): r is string => !!r))];
    if (!unicos.length) return new Map();
    const usuarios = await this.sUsuarioModel.findAll({
      where: { N_Usuario: { [Op.in]: unicos } },
      attributes: ['N_Usuario', 'Nombre'],
    });
    return new Map(usuarios.map((u) => [u.N_Usuario, u.Nombre]));
  }

  private async decorarConNombres(solicitudes: SolicitudConsultaModel[]) {
    const rfcs = solicitudes.flatMap((s) => [s.rfc_solicita, s.rfc_revisa]);
    const nombres = await this.resolveNombres(rfcs);
    return solicitudes.map((s) => ({
      ...s.get({ plain: true }),
      nombre_solicita: nombres.get(s.rfc_solicita) ?? s.rfc_solicita,
      nombre_revisa: s.rfc_revisa ? (nombres.get(s.rfc_revisa) ?? s.rfc_revisa) : null,
      vigente: this.esVigente(s),
    }));
  }

  // Una consulta autorizada solo sigue vigente mientras no se pase de la fecha límite fijada por RAC.
  private esVigente(s: SolicitudConsultaModel): boolean {
    if (s.estado !== 'autorizada' || !s.fecha_limite) return false;
    const hoy = new Date().toISOString().slice(0, 10);
    return s.fecha_limite >= hoy;
  }

  private clasificacionExpediente(e: ExpedienteSerieSubseModel): string {
    const serie = e.serie ?? e.subSerie?.serie ?? null;
    const seccion = serie?.seccion ?? null;
    const subfondo = seccion?.subfondoParent ?? null;
    const partes = [
      subfondo?.subfondo,
      seccion?.seccion,
      serie?.serie,
      e.subSerie?.subserie,
    ].filter(Boolean);
    return partes.length ? partes.join(' › ') : 'Sin clasificar';
  }

  // Expedientes del departamento del RAT que ya entraron al proceso de transferencia primaria
  // (en trámite de transferencia o ya recibidos en Concentración) y sin una consulta activa vigente.
  async getElegibles(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];
    const expedienteIds = await this.getExpedienteIdsDeptos(deptIds);
    if (!expedienteIds.length) return [];

    const expedientes = await this.expedienteModel.findAll({
      where: {
        id: { [Op.in]: expedienteIds },
        id_solicitud_transferencia: { [Op.ne]: null },
      },
      include: EXPEDIENTE_CLASIFICACION_INCLUDE,
      order: [['updated_at', 'DESC']],
    });
    if (!expedientes.length) return [];

    const conSolicitud = await this.solicitudExpedienteModel.findAll({
      where: { id_expediente: { [Op.in]: expedientes.map((e) => e.id) } },
      include: [{ model: SolicitudConsultaModel, as: 'solicitud', where: { estado: { [Op.in]: ['pendiente', 'autorizada'] } } }],
    });
    // Una consulta autorizada que ya venció no bloquea una nueva solicitud sobre el mismo expediente.
    const idsConConsultaVigente = new Set(
      conSolicitud
        .filter((v) => v.solicitud.estado === 'pendiente' || this.esVigente(v.solicitud))
        .map((v) => v.id_expediente),
    );

    return expedientes
      .filter((e) => !idsConConsultaVigente.has(e.id))
      .map((e) => ({
        id: e.id,
        nombre_ex: e.nombre_ex,
        anio: e.anio,
        serie_nombre: e.serie?.serie ?? e.subSerie?.subserie ?? null,
        clasificacion: this.clasificacionExpediente(e),
      }));
  }

  async crearSolicitud(rfc: string, expedienteIds: number[]) {
    if (!expedienteIds?.length) {
      throw new BadRequestException('Selecciona al menos un expediente para consultar.');
    }
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) {
      throw new BadRequestException('El usuario no tiene un departamento de archivo de trámite asignado.');
    }

    const solicitud = await this.solicitudModel.create({
      id_departamento: deptIds[0],
      rfc_solicita: rfc,
      estado: 'pendiente',
    });

    await this.solicitudExpedienteModel.bulkCreate(
      expedienteIds.map((id) => ({ id_solicitud_consulta: solicitud.id, id_expediente: id })),
    );

    return this.getDetalle(solicitud.id);
  }

  async getPendientes() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'pendiente' },
      order: [['created_at', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  async getMisSolicitudes(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];
    const solicitudes = await this.solicitudModel.findAll({
      where: { id_departamento: { [Op.in]: deptIds } },
      order: [['created_at', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  async autorizar(id: number, rfc: string, autoriza: boolean, motivo?: string, fechaLimite?: string) {
    const solicitud = await this.solicitudModel.findByPk(id);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('La solicitud ya fue revisada.');
    }
    if (autoriza) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (!fechaLimite || fechaLimite < hoy) {
        throw new BadRequestException('Debes definir una fecha límite de vigencia (posterior a hoy) para autorizar la consulta.');
      }
    }

    await solicitud.update({
      rfc_revisa: rfc,
      fecha_revision: new Date(),
      autorizada: autoriza,
      motivo_rechazo: autoriza ? null : (motivo ?? null),
      estado: autoriza ? 'autorizada' : 'rechazada',
      fecha_limite: autoriza ? fechaLimite : null,
    });

    return this.getDetalle(id);
  }

  async getAutorizadas() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'autorizada' },
      order: [['fecha_revision', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  async getRechazadas() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'rechazada' },
      order: [['fecha_revision', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  async getDetalle(id: number) {
    const solicitud = await this.solicitudModel.findByPk(id, {
      include: [
        {
          model: SolicitudConsultaExpedienteModel,
          as: 'expedientes',
          include: [{ model: ExpedienteSerieSubseModel, as: 'expediente', include: EXPEDIENTE_CLASIFICACION_INCLUDE }],
        },
      ],
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const nombres = await this.resolveNombres([solicitud.rfc_solicita, solicitud.rfc_revisa]);

    return {
      id: solicitud.id,
      id_departamento: solicitud.id_departamento,
      rfc_solicita: solicitud.rfc_solicita,
      nombre_solicita: nombres.get(solicitud.rfc_solicita) ?? solicitud.rfc_solicita,
      rfc_revisa: solicitud.rfc_revisa,
      nombre_revisa: solicitud.rfc_revisa ? (nombres.get(solicitud.rfc_revisa) ?? solicitud.rfc_revisa) : null,
      fecha_revision: solicitud.fecha_revision,
      autorizada: solicitud.autorizada,
      motivo_rechazo: solicitud.motivo_rechazo,
      estado: solicitud.estado,
      fecha_limite: solicitud.fecha_limite,
      vigente: this.esVigente(solicitud),
      created_at: solicitud.get('created_at'),
      expedientes: (solicitud.expedientes ?? []).map((je) => {
        const e = je.expediente;
        return {
          id: e.id,
          nombre_ex: e.nombre_ex,
          anio: e.anio,
          serie_nombre: e.serie?.serie ?? e.subSerie?.subserie ?? null,
          clasificacion: this.clasificacionExpediente(e),
        };
      }),
    };
  }
}
