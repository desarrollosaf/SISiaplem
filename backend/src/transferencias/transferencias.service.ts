import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import pdfMake = require('pdfmake');
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SeccionModel } from '../models/seccion.model';
import { SubfondoModel } from '../models/subfondo.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SolicitudTransferenciaModel } from '../models/solicitud-transferencia.model';
import { SUsuario } from '../models/s-usuario.model';

pdfMake.setFonts({
  Roboto: {
    normal: require.resolve('pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: require.resolve('pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: require.resolve('pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: require.resolve('pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'),
  },
});

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
export class TransferenciasService {
  constructor(
    @InjectModel(ResponsableArchivoModel) private responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(SerieModel) private serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel) private subSerieModel: typeof SubSerieModel,
    @InjectModel(ExpedienteSerieSubseModel) private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(SolicitudTransferenciaModel) private solicitudModel: typeof SolicitudTransferenciaModel,
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

  // Nombres de las personas (RFC -> Nombre completo), para no mostrar puros RFC en pantalla
  private async resolveNombres(rfcs: (string | null | undefined)[]): Promise<Map<string, string>> {
    const unicos = [...new Set(rfcs.filter((r): r is string => !!r))];
    if (!unicos.length) return new Map();
    const usuarios = await this.sUsuarioModel.findAll({
      where: { N_Usuario: { [Op.in]: unicos } },
      attributes: ['N_Usuario', 'Nombre'],
    });
    return new Map(usuarios.map((u) => [u.N_Usuario, u.Nombre]));
  }

  private async decorarConNombres(solicitudes: SolicitudTransferenciaModel[]) {
    const rfcs = solicitudes.flatMap((s) => [s.rfc_solicita, s.rfc_revisa, s.rfc_recibe]);
    const nombres = await this.resolveNombres(rfcs);
    return solicitudes.map((s) => ({
      ...s.get({ plain: true }),
      nombre_solicita: nombres.get(s.rfc_solicita) ?? s.rfc_solicita,
      nombre_revisa: s.rfc_revisa ? (nombres.get(s.rfc_revisa) ?? s.rfc_revisa) : null,
      nombre_recibe: s.rfc_recibe ? (nombres.get(s.rfc_recibe) ?? s.rfc_recibe) : null,
    }));
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

  // Paso 1: expedientes concluidos, sin transferencia activa — para armar el inventario
  async getElegibles(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];
    const expedienteIds = await this.getExpedienteIdsDeptos(deptIds);
    if (!expedienteIds.length) return [];

    const expedientes = await this.expedienteModel.findAll({
      where: {
        id: { [Op.in]: expedienteIds },
        status: true,
        fecha_cierre_exp: { [Op.ne]: null },
        id_solicitud_transferencia: null,
      },
      include: EXPEDIENTE_CLASIFICACION_INCLUDE,
      order: [['fecha_cierre_exp', 'DESC']],
    });

    return expedientes.map((e) => ({
      id: e.id,
      nombre_ex: e.nombre_ex,
      anio: e.anio,
      fecha_cierre_exp: e.fecha_cierre_exp,
      serie_nombre: e.serie?.serie ?? e.subSerie?.subserie ?? null,
      clasificacion: this.clasificacionExpediente(e),
    }));
  }

  // Paso 1: crear solicitud + vincular expedientes elegidos
  async crearSolicitud(rfc: string, expedienteIds: number[]) {
    if (!expedienteIds?.length) {
      throw new BadRequestException('Selecciona al menos un expediente para transferir.');
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

    await this.expedienteModel.update(
      { id_solicitud_transferencia: solicitud.id },
      { where: { id: { [Op.in]: expedienteIds }, id_solicitud_transferencia: null } },
    );

    return this.getDetalle(solicitud.id);
  }

  // Paso 2 (bandeja de RAC): solicitudes pendientes de revisión, de cualquier departamento
  async getPendientes() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'pendiente' },
      order: [['created_at', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  // Mis solicitudes (historial, cualquier estado) del departamento del usuario
  async getMisSolicitudes(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];
    const solicitudes = await this.solicitudModel.findAll({
      where: { id_departamento: { [Op.in]: deptIds } },
      order: [['created_at', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  // Paso 3-4 (RAC): autorizar o rechazar
  async autorizar(id: number, rfc: string, autoriza: boolean, motivo?: string) {
    const solicitud = await this.solicitudModel.findByPk(id);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('La solicitud ya fue revisada.');
    }

    await solicitud.update({
      rfc_revisa: rfc,
      fecha_revision: new Date(),
      autorizada: autoriza,
      motivo_rechazo: autoriza ? null : (motivo ?? null),
      estado: autoriza ? 'autorizada' : 'rechazada',
    });

    if (!autoriza) {
      // Regreso al pool de elegibles (flujo punteado del diagrama)
      await this.expedienteModel.update(
        { id_solicitud_transferencia: null },
        { where: { id_solicitud_transferencia: id } },
      );
    }

    return this.getDetalle(id);
  }

  // Paso 5 (bandeja RAC): solicitudes autorizadas, pendientes de recepción
  async getAutorizadas() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'autorizada' },
      order: [['fecha_revision', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  // Historial de solicitudes rechazadas (con motivo)
  async getRechazadas() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'rechazada' },
      order: [['fecha_revision', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  // Paso 5-6: Archivo de Concentración recibe los expedientes
  async recibir(id: number, rfc: string) {
    const solicitud = await this.solicitudModel.findByPk(id);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.estado !== 'autorizada') {
      throw new BadRequestException('La solicitud no está autorizada o ya fue recibida.');
    }

    await solicitud.update({
      rfc_recibe: rfc,
      fecha_recepcion: new Date(),
      estado: 'recibida',
    });

    // El expediente pasa a custodia de Concentración: desaparece de las vistas de Archivo de Trámite
    await this.expedienteModel.update(
      { status: false },
      { where: { id_solicitud_transferencia: id } },
    );

    return this.getDetalle(id);
  }

  // Historial de recepciones (para la bandeja de solicitudes recibidas en Concentración)
  async getRecibidas() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'recibida' },
      order: [['fecha_recepcion', 'DESC']],
    });
    return this.decorarConNombres(solicitudes);
  }

  // Expedientes ya recibidos, aplanados (para "Expedientes Recibidos")
  async getExpedientesRecibidos() {
    const solicitudes = await this.solicitudModel.findAll({
      where: { estado: 'recibida' },
      attributes: ['id', 'fecha_recepcion'],
    });
    if (!solicitudes.length) return [];
    const fechaPorSolicitud = new Map(solicitudes.map((s) => [s.id, s.fecha_recepcion]));

    const expedientes = await this.expedienteModel.findAll({
      where: { id_solicitud_transferencia: { [Op.in]: solicitudes.map((s) => s.id) } },
      include: EXPEDIENTE_CLASIFICACION_INCLUDE,
      order: [['updated_at', 'DESC']],
    });

    return expedientes.map((e) => ({
      id: e.id,
      nombre_ex: e.nombre_ex,
      anio: e.anio,
      serie_nombre: e.serie?.serie ?? e.subSerie?.subserie ?? null,
      clasificacion: this.clasificacionExpediente(e),
      id_solicitud_transferencia: e.id_solicitud_transferencia,
      fecha_recepcion: fechaPorSolicitud.get(e.id_solicitud_transferencia as number) ?? null,
    }));
  }

  async getDetalle(id: number) {
    const solicitud = await this.solicitudModel.findByPk(id, {
      include: [
        {
          model: ExpedienteSerieSubseModel,
          include: EXPEDIENTE_CLASIFICACION_INCLUDE,
        },
      ],
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const nombres = await this.resolveNombres([solicitud.rfc_solicita, solicitud.rfc_revisa, solicitud.rfc_recibe]);

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
      rfc_recibe: solicitud.rfc_recibe,
      nombre_recibe: solicitud.rfc_recibe ? (nombres.get(solicitud.rfc_recibe) ?? solicitud.rfc_recibe) : null,
      fecha_recepcion: solicitud.fecha_recepcion,
      estado: solicitud.estado,
      created_at: solicitud.get('created_at'),
      expedientes: (solicitud.expedientes ?? []).map((e) => ({
        id: e.id,
        nombre_ex: e.nombre_ex,
        anio: e.anio,
        fecha_cierre_exp: e.fecha_cierre_exp,
        serie_nombre: e.serie?.serie ?? e.subSerie?.subserie ?? null,
        clasificacion: this.clasificacionExpediente(e),
      })),
    };
  }

  async getActaPdf(id: number, tipo: 'revision' | 'transferencia'): Promise<Buffer> {
    const detalle = await this.getDetalle(id);

    const titulo = tipo === 'revision'
      ? `Acta de revisión de expedientes de archivo de trámite concluido — Solicitud #${detalle.id}`
      : `Acta de transferencia primaria — Solicitud #${detalle.id}`;

    const contenido: any[] = [{ text: titulo, style: 'header' }];

    if (tipo === 'revision') {
      contenido.push({
        text: detalle.autorizada
          ? 'Resultado: PROCEDENTE'
          : `Resultado: IMPROCEDENTE${detalle.motivo_rechazo ? ` — Motivo: ${detalle.motivo_rechazo}` : ''}`,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      });
    } else {
      contenido.push({
        text: `Recibido por: ${detalle.nombre_recibe ?? '—'}   Fecha: ${detalle.fecha_recepcion ? new Date(detalle.fecha_recepcion).toLocaleDateString('es-MX') : '—'}`,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      });
    }

    const items = detalle.expedientes.map((e) => `${e.nombre_ex} (${e.anio}) — ${e.clasificacion}`);
    contenido.push(items.length ? { ul: items } : { text: 'Sin expedientes registrados.', italics: true });

    const docDefinition = {
      content: contenido,
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 12] as [number, number, number, number] },
      },
      defaultStyle: { font: 'Roboto' },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }
}
