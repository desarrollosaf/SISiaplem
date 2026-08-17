import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
import { TDepartamento } from '../models/t-departamento.model';
import { TDependencia } from '../models/t-dependencia.model';
import { ValorDocumentalSerieSubserieModel } from '../models/valor_documental_serie_subserie.model';
import { ValorDocumentalsModel } from '../models/valor_documentals.model';
import { HEADER_LOGO_BASE64, capitalizar } from '../common/pdf-utils';

pdfMake.setFonts({
  Roboto: {
    normal: require.resolve('pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: require.resolve('pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: require.resolve('pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics:
      require.resolve('pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'),
  },
});

const EXPEDIENTE_CLASIFICACION_INCLUDE = [
  {
    model: SerieModel,
    include: [{ model: SeccionModel, include: [{ model: SubfondoModel }] }],
  },
  {
    model: SubSerieModel,
    include: [
      {
        model: SerieModel,
        include: [{ model: SeccionModel, include: [{ model: SubfondoModel }] }],
      },
    ],
  },
];

@Injectable()
export class TransferenciasService {
  constructor(
    @InjectModel(ResponsableArchivoModel)
    private responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(SerieModel) private serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel) private subSerieModel: typeof SubSerieModel,
    @InjectModel(ExpedienteSerieSubseModel)
    private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(SolicitudTransferenciaModel)
    private solicitudModel: typeof SolicitudTransferenciaModel,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
    @InjectModel(TDepartamento, 'saf')
    private departamentoModel: typeof TDepartamento,
    @InjectModel(TDependencia, 'saf')
    private dependenciaModel: typeof TDependencia,
    @InjectModel(ValorDocumentalSerieSubserieModel)
    private valorSerieModel: typeof ValorDocumentalSerieSubserieModel,
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
    const serieIds = (
      await this.serieModel.findAll({
        where: { departamento_id: { [Op.in]: deptIds } },
        attributes: ['id'],
      })
    ).map((s) => s.id);
    const subserieIds = (
      await this.subSerieModel.findAll({
        where: { id_Departamento: { [Op.in]: deptIds } },
        attributes: ['id'],
      })
    ).map((s) => s.id);

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
  private async resolveNombres(
    rfcs: (string | null | undefined)[],
  ): Promise<Map<string, string>> {
    const unicos = [...new Set(rfcs.filter((r): r is string => !!r))];
    if (!unicos.length) return new Map();
    const usuarios = await this.sUsuarioModel.findAll({
      where: { N_Usuario: { [Op.in]: unicos } },
      attributes: ['N_Usuario', 'Nombre'],
    });
    return new Map(usuarios.map((u) => [u.N_Usuario, u.Nombre]));
  }

  private async decorarConNombres(solicitudes: SolicitudTransferenciaModel[]) {
    const rfcs = solicitudes.flatMap((s) => [
      s.rfc_solicita,
      s.rfc_revisa,
      s.rfc_recibe,
    ]);
    const nombres = await this.resolveNombres(rfcs);
    return solicitudes.map((s) => ({
      ...s.get({ plain: true }),
      nombre_solicita: nombres.get(s.rfc_solicita) ?? s.rfc_solicita,
      nombre_revisa: s.rfc_revisa
        ? (nombres.get(s.rfc_revisa) ?? s.rfc_revisa)
        : null,
      nombre_recibe: s.rfc_recibe
        ? (nombres.get(s.rfc_recibe) ?? s.rfc_recibe)
        : null,
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
      throw new BadRequestException(
        'Selecciona al menos un expediente para transferir.',
      );
    }
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) {
      throw new BadRequestException(
        'El usuario no tiene un departamento de archivo de trámite asignado.',
      );
    }

    const solicitud = await this.solicitudModel.create({
      id_departamento: deptIds[0],
      rfc_solicita: rfc,
      estado: 'pendiente',
    });

    await this.expedienteModel.update(
      { id_solicitud_transferencia: solicitud.id },
      {
        where: {
          id: { [Op.in]: expedienteIds },
          id_solicitud_transferencia: null,
        },
      },
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
      throw new BadRequestException(
        'La solicitud no está autorizada o ya fue recibida.',
      );
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
    const fechaPorSolicitud = new Map(
      solicitudes.map((s) => [s.id, s.fecha_recepcion]),
    );

    const expedientes = await this.expedienteModel.findAll({
      where: {
        id_solicitud_transferencia: { [Op.in]: solicitudes.map((s) => s.id) },
      },
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
      fecha_recepcion:
        fechaPorSolicitud.get(e.id_solicitud_transferencia as number) ?? null,
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

    const nombres = await this.resolveNombres([
      solicitud.rfc_solicita,
      solicitud.rfc_revisa,
      solicitud.rfc_recibe,
    ]);

    return {
      id: solicitud.id,
      id_departamento: solicitud.id_departamento,
      rfc_solicita: solicitud.rfc_solicita,
      nombre_solicita:
        nombres.get(solicitud.rfc_solicita) ?? solicitud.rfc_solicita,
      rfc_revisa: solicitud.rfc_revisa,
      nombre_revisa: solicitud.rfc_revisa
        ? (nombres.get(solicitud.rfc_revisa) ?? solicitud.rfc_revisa)
        : null,
      fecha_revision: solicitud.fecha_revision,
      autorizada: solicitud.autorizada,
      motivo_rechazo: solicitud.motivo_rechazo,
      rfc_recibe: solicitud.rfc_recibe,
      nombre_recibe: solicitud.rfc_recibe
        ? (nombres.get(solicitud.rfc_recibe) ?? solicitud.rfc_recibe)
        : null,
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

  async getActaPdf(
    id: number,
    tipo: 'revision' | 'transferencia',
  ): Promise<Buffer> {
    const detalle = await this.getDetalle(id);

    const titulo =
      tipo === 'revision'
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

    const items = detalle.expedientes.map(
      (e) => `${e.nombre_ex} (${e.anio}) — ${e.clasificacion}`,
    );
    contenido.push(
      items.length
        ? { ul: items }
        : { text: 'Sin expedientes registrados.', italics: true },
    );

    const docDefinition = {
      content: contenido,
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 12] as [number, number, number, number],
        },
      },
      defaultStyle: { font: 'Roboto' },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // GuiaController.inventarioTransferenciaPdf() — Anexo 8/0775 43031-F05-26 "Inventario de transferencia de expedientes al Archivo de Concentración" (SAF), para una solicitud ya creada
  async getInventarioPdf(id: number): Promise<Buffer> {
    const solicitud = await this.solicitudModel.findByPk(id, {
      include: [
        {
          model: ExpedienteSerieSubseModel,
          include: EXPEDIENTE_CLASIFICACION_INCLUDE,
        },
      ],
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const expedientes = solicitud.expedientes ?? [];
    const serieIds = [
      ...new Set(
        expedientes.map((e) => e.serie?.id).filter((v): v is number => !!v),
      ),
    ];
    const subserieIds = [
      ...new Set(
        expedientes.map((e) => e.subSerie?.id).filter((v): v is number => !!v),
      ),
    ];

    const [nombres, departamento] = await Promise.all([
      this.resolveNombres([
        solicitud.rfc_solicita,
        solicitud.rfc_revisa,
        solicitud.rfc_recibe,
      ]),
      this.departamentoModel.findOne({
        where: { id_Departamento: solicitud.id_departamento },
      }),
    ]);

    const dependencia = departamento?.id_Dependencia
      ? await this.dependenciaModel.findOne({
          where: { id_Dependencia: departamento.id_Dependencia },
        })
      : null;

    const condiciones: Record<string, unknown>[] = [];
    if (serieIds.length) condiciones.push({ id_serie: { [Op.in]: serieIds } });
    if (subserieIds.length)
      condiciones.push({ id_subserie: { [Op.in]: subserieIds } });

    const valores = condiciones.length
      ? await this.valorSerieModel.findAll({
          where: { [Op.or]: condiciones },
          include: [{ model: ValorDocumentalsModel }],
        })
      : [];
    const valoresPorSerie = new Map<number, Set<string>>();
    const valoresPorSubserie = new Map<number, Set<string>>();
    for (const v of valores) {
      const nombreValor = v.valor?.valor;
      if (!nombreValor) continue;
      if (v.id_serie) {
        if (!valoresPorSerie.has(v.id_serie))
          valoresPorSerie.set(v.id_serie, new Set());
        valoresPorSerie.get(v.id_serie)!.add(nombreValor);
      }
      if (v.id_subserie) {
        if (!valoresPorSubserie.has(v.id_subserie))
          valoresPorSubserie.set(v.id_subserie, new Set());
        valoresPorSubserie.get(v.id_subserie)!.add(nombreValor);
      }
    }

    const nombreSolicita = capitalizar(
      nombres.get(solicitud.rfc_solicita) ?? solicitud.rfc_solicita,
    );
    const nombreRevisa = solicitud.rfc_revisa
      ? capitalizar(nombres.get(solicitud.rfc_revisa) ?? solicitud.rfc_revisa)
      : '';
    const nombreRecibe = solicitud.rfc_recibe
      ? capitalizar(nombres.get(solicitud.rfc_recibe) ?? solicitud.rfc_recibe)
      : '';
    const dependenciaNombre = capitalizar(dependencia?.nombre_completo ?? '');
    const unidadNombre = capitalizar(
      departamento?.nom_cap ?? departamento?.Nombre ?? '',
    );
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatoFecha = (fecha: Date | string | null) => {
      if (!fecha) return '';
      const d = new Date(fecha);
      if (Number.isNaN(d.getTime())) return '';
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };

    const anchoColSignat = (677 - 24) / 3;
    const lineaFirma = () => ({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: anchoColSignat,
          y2: 0,
          lineWidth: 0.5,
        },
      ],
    });
    const columnaFirma = (
      nombre: string,
      etiqueta: string,
      caption: string,
    ) => ({
      width: anchoColSignat,
      alignment: 'center' as const,
      stack: [
        { text: etiqueta, bold: true, fontSize: 8 },
        {
          text: nombre || ' ',
          bold: true,
          fontSize: 9,
          margin: [0, 14, 0, 2] as [number, number, number, number],
        },
        lineaFirma(),
        {
          text: caption,
          bold: true,
          fontSize: 7,
          margin: [0, 2, 0, 0] as [number, number, number, number],
        },
      ],
    });

    const etiquetaChica = (texto: string, numero?: number) => ({
      text: numero
        ? [
            { text: `${texto} `, bold: true },
            { text: `(${numero})`, fontSize: 6 },
          ]
        : [{ text: texto, bold: true }],
      fontSize: 7,
      alignment: 'center' as const,
      fillColor: '#d8d8d8',
    });

    const filaDatos = (celdas: string[]) =>
      celdas.map((texto) => ({
        text: texto || ' ',
        fontSize: 8,
        alignment: 'center' as const,
        margin: [0, 1, 0, 1] as [number, number, number, number],
      }));

    const filasTabla: unknown[][] = [
      [
        { ...etiquetaChica('NÚM. DE CAJA'), rowSpan: 2 },
        { ...etiquetaChica('NÚM. EXP. POR CAJA'), rowSpan: 2 },
        { ...etiquetaChica('NÚM. FOJAS'), rowSpan: 2 },
        { ...etiquetaChica('NÚM. DE FOLIOS'), rowSpan: 2 },
        { ...etiquetaChica('CÓDIGO DE SERIE'), rowSpan: 2 },
        { ...etiquetaChica('NOMBRE DE LA SERIE'), rowSpan: 2 },
        { ...etiquetaChica('NOMBRE DEL EXPEDIENTE'), rowSpan: 2 },
        { ...etiquetaChica('PLAZO PRECAUTORIO (AÑOS)'), rowSpan: 2 },
        {
          text: 'VALORES',
          bold: true,
          fontSize: 7,
          colSpan: 3,
          alignment: 'center',
          fillColor: '#d8d8d8',
        },
        {},
        {},
      ],
      [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        etiquetaChica('ADM.'),
        etiquetaChica('LEG.'),
        etiquetaChica('FISC./CONT.'),
      ],
    ];

    for (const e of expedientes) {
      const serie = e.serie ?? null;
      const subserie = e.subSerie ?? null;
      const valoresExp = serie
        ? (valoresPorSerie.get(serie.id) ?? new Set<string>())
        : subserie
          ? (valoresPorSubserie.get(subserie.id) ?? new Set<string>())
          : new Set<string>();
      filasTabla.push(
        filaDatos([
          '',
          '',
          '',
          '',
          serie?.codigo ?? subserie?.codigo ?? '',
          serie?.serie ?? subserie?.subserie ?? '',
          e.nombre_ex,
          serie ? String(serie.anios_consentracion) : '',
          valoresExp.has('Administrativo') ? 'X' : '',
          valoresExp.has('Legal') ? 'X' : '',
          valoresExp.has('Fiscal') || valoresExp.has('Contable') ? 'X' : '',
        ]),
      );
    }
    if (filasTabla.length === 2) {
      filasTabla.push(filaDatos(['', '', '', '', '', '', '', '', '', '', '']));
    }

    const content: Record<string, unknown>[] = [
      HEADER_LOGO_BASE64
        ? {
            image: HEADER_LOGO_BASE64,
            width: 385,
            height: 64,
            alignment: 'center',
            margin: [0, 0, 0, 7],
          }
        : {
            text: 'Coordinación de Normatividad, Desarrollo Administrativo y de Archivos\nUnidad Coordinadora de Gestión Documental y Administración de Archivos',
            alignment: 'center',
            fontSize: 8,
            margin: [0, 20, 0, 14],
          },
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: 'INVENTARIO DE TRANSFERENCIA DE EXPEDIENTES AL ARCHIVO DE CONCENTRACIÓN',
                bold: true,
                fontSize: 10,
                alignment: 'center',
                fillColor: '#a5a5a5',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 18],
      },
      {
        table: {
          widths: [61, 379, 96, 105],
          body: [
            [
              { text: 'DEPENDENCIA:', bold: true, fontSize: 8 },
              { text: dependenciaNombre, fontSize: 9 },
              { text: 'PÁG. NÚM.: 1', bold: true, fontSize: 7 },
              { text: 'DE: 1', bold: true, fontSize: 7 },
            ],
            [
              { text: 'UNIDAD ADMINISTRATIVA:', bold: true, fontSize: 8 },
              { text: unidadNombre, fontSize: 9 },
              {
                text: [
                  { text: 'FECHA DEL OFICIO\n', bold: true, fontSize: 6 },
                  { text: '—', fontSize: 8 },
                ],
                alignment: 'center',
              },
              {
                text: [
                  { text: 'FECHA DE RECEPCIÓN\n', bold: true, fontSize: 6 },
                  {
                    text: formatoFecha(solicitud.fecha_recepcion) || '—',
                    fontSize: 8,
                  },
                ],
                alignment: 'center',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          headerRows: 2,
          widths: [33, 34, 29, 30, 35, 90, 212, 50, 24, 21, 21],
          body: filasTabla,
        },
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          columnaFirma(nombreSolicita, 'SOLICITA', 'UNIDAD ADMINISTRATIVA'),
          columnaFirma(
            nombreRevisa,
            'AUTORIZA',
            'UNIDAD COORDINADORA DE GESTIÓN DOCUMENTAL Y ADMINISTRACIÓN DE ARCHIVOS',
          ),
          columnaFirma(nombreRecibe, 'RECIBE', 'ARCHIVO DE CONCENTRACIÓN'),
        ],
        columnGap: 12,
      },
      {
        text: 'Anexo 8/0775 43031-F05-26',
        alignment: 'right',
        bold: true,
        fontSize: 7,
        margin: [0, 9, 0, 0],
      },
    ];

    const docDefinition = {
      pageSize: 'LETTER' as const,
      pageOrientation: 'landscape' as const,
      pageMargins: [56, 20, 56, 20] as [number, number, number, number],
      content,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }
}
