import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { existsSync } from 'fs';
import { join } from 'path';
import pdfMake = require('pdfmake');
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { RegistroModel } from '../models/registro.model';
import { RegistroDocsModel } from '../models/registro-docs.model';
import { RegistroFisicoModel } from '../models/registro-fisico.model';
import { DocumentosEnvioModel } from '../models/documentos-envio.model';
import { TipoDocModel } from '../models/tipo-doc.model';
import { TipoExpedienteTratamientoModel } from '../models/tipo-expediente-tratamiento.model';
import { SolicitudTransferenciaModel } from '../models/solicitud-transferencia.model';
import { SUsuario } from '../models/s-usuario.model';
import { TDepartamento } from '../models/t-departamento.model';
import { TDependencia } from '../models/t-dependencia.model';
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

@Injectable()
export class GuiaService {
  constructor(
    @InjectModel(ResponsableArchivoModel)
    private responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(SerieModel) private serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel) private subSerieModel: typeof SubSerieModel,
    @InjectModel(ExpedienteSerieSubseModel)
    private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(RegistroModel) private registroModel: typeof RegistroModel,
    @InjectModel(RegistroDocsModel)
    private registroDocsModel: typeof RegistroDocsModel,
    @InjectModel(RegistroFisicoModel)
    private registroFisicoModel: typeof RegistroFisicoModel,
    @InjectModel(DocumentosEnvioModel)
    private documentosEnvioModel: typeof DocumentosEnvioModel,
    @InjectModel(TipoExpedienteTratamientoModel)
    private tipoTratamientoModel: typeof TipoExpedienteTratamientoModel,
    @InjectModel(SolicitudTransferenciaModel)
    private solicitudTransferenciaModel: typeof SolicitudTransferenciaModel,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
    @InjectModel(TDepartamento, 'saf')
    private departamentoModel: typeof TDepartamento,
    @InjectModel(TDependencia, 'saf')
    private dependenciaModel: typeof TDependencia,
  ) {}

  private async getDeptIds(rfc: string): Promise<number[]> {
    const responsables = await this.responsableModel.findAll({
      where: { rfc_responsable: rfc, status: true },
      attributes: ['id_Departamento'],
    });
    return responsables.map((r) => r.get('id_Departamento') as number);
  }

  // Guia.index() — series del usuario con subseries y conteo de expedientes, agrupables por departamento
  // (un responsable puede tener a su cargo más de un departamento/dirección a la vez)
  async getInventario(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];

    const departamentos = await this.departamentoModel.findAll({
      where: { id_Departamento: { [Op.in]: deptIds } },
    });
    const nombrePorDepto = new Map(
      departamentos.map((d) => [d.id_Departamento, d.nombre_completo]),
    );

    const series = await this.serieModel.findAll({
      where: { departamento_id: { [Op.in]: deptIds }, status: 1 },
      order: [['codigo', 'ASC']],
    });

    const result: {
      id: number;
      codigo: string;
      serie: string;
      total_expedientes: number;
      departamento_id: number | null;
      departamento_nombre: string | null;
      subseries: {
        id: number;
        codigo: string;
        subserie: string;
        total_expedientes: number;
      }[];
    }[] = [];
    for (const serie of series) {
      const total_expedientes = await this.expedienteModel.count({
        where: { id_serie: serie.id, status: true },
      });
      const subseriesModels = await this.subSerieModel.findAll({
        where: { idSerie: serie.id, status: 1 },
        order: [['codigo', 'ASC']],
      });
      const subseries = await Promise.all(
        subseriesModels.map(async (ss) => ({
          id: ss.id,
          codigo: ss.codigo,
          subserie: ss.subserie,
          total_expedientes: await this.expedienteModel.count({
            where: { id_subserie: ss.id, status: true },
          }),
        })),
      );
      result.push({
        id: serie.id,
        codigo: serie.codigo,
        serie: serie.serie,
        total_expedientes,
        departamento_id: serie.departamento_id ?? null,
        departamento_nombre: serie.departamento_id
          ? (nombrePorDepto.get(serie.departamento_id) ?? null)
          : null,
        subseries,
      });
    }
    return result;
  }

  // GuiaController.expedienteSerie() — expedientes de una serie
  async getExpedientesSerie(id: number) {
    return this.expedienteModel.findAll({
      where: { id_serie: id, status: true },
      order: [
        ['anio', 'DESC'],
        ['nombre_ex', 'ASC'],
      ],
    });
  }

  // GuiaController.expedienteSerieSub() — expedientes de una subserie
  async getExpedientesSubserie(id: number) {
    return this.expedienteModel.findAll({
      where: { id_subserie: id, status: true },
      order: [
        ['anio', 'DESC'],
        ['nombre_ex', 'ASC'],
      ],
    });
  }

  private async getExpedientesPorEstado(rfc: string, cerrados: boolean) {
    const deptIds = await this.getDeptIds(rfc);
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
        status: true,
        fecha_cierre_exp: cerrados ? { [Op.ne]: null } : null,
      },
      include: [{ model: SerieModel }, { model: SubSerieModel }],
      order: cerrados
        ? [['fecha_cierre_exp', 'DESC']]
        : [['created_at', 'DESC']],
    });

    return expedientes.map((e) => ({
      id: e.id,
      nombre_ex: e.nombre_ex,
      anio: e.anio,
      fecha_cierre_exp: e.fecha_cierre_exp,
      status: e.status,
      serie_codigo: e.serie?.codigo ?? null,
      serie_nombre: e.serie?.serie ?? null,
      subserie_codigo: e.subSerie?.codigo ?? null,
      subserie_nombre: e.subSerie?.subserie ?? null,
    }));
  }

  // GuiaController.expActivos()
  async getActivos(rfc: string) {
    return this.getExpedientesPorEstado(rfc, false);
  }

  // GuiaController.actividadReciente() — últimos archivos (documentos) registrados en expedientes del usuario
  async getActividadReciente(rfc: string, limit = 5) {
    const deptIds = await this.getDeptIds(rfc);
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
        status: true,
      },
      include: [{ model: SerieModel }, { model: SubSerieModel }],
    });
    if (!expedientes.length) return [];

    const expedienteMap = new Map(expedientes.map((e) => [e.id, e]));
    const expedienteIds = expedientes.map((e) => e.id);

    const [digitales, docs, fisicos] = await Promise.all([
      this.registroModel.findAll({
        where: { expediente_id: { [Op.in]: expedienteIds }, status: true },
        order: [['created_at', 'DESC']],
        limit,
      }),
      this.registroDocsModel.findAll({
        where: { expediente_id: { [Op.in]: expedienteIds }, status: true },
        include: [{ model: TipoDocModel }],
        order: [['created_at', 'DESC']],
        limit,
      }),
      this.registroFisicoModel.findAll({
        where: { expediente_id: { [Op.in]: expedienteIds }, status: true },
        order: [['created_at', 'DESC']],
        limit,
      }),
    ]);

    const archivos = [
      ...digitales.map((d) => ({
        id: `reg-${d.id}`,
        folio: d.folio,
        titulo: d.titulo_doc,
        tipo: 'Digital',
        expediente_id: d.expediente_id,
        fecha: d.get('created_at') as Date,
      })),
      ...docs.map((d) => ({
        id: `docs-${d.id}`,
        folio: d.folio,
        titulo: d.titulo_doc ?? d.tipo?.tipo_doc ?? 'Documento',
        tipo: d.tipo?.tipo_doc ?? 'Documento',
        expediente_id: d.expediente_id,
        fecha: d.get('created_at') as Date,
      })),
      ...fisicos.map((f) => ({
        id: `fis-${f.id}`,
        folio: f.folio,
        titulo: f.titulo_doc,
        tipo: 'Físico',
        expediente_id: f.expediente_id,
        fecha: f.get('created_at') as Date,
      })),
    ];

    archivos.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

    return archivos.slice(0, limit).map((a) => {
      const exp = expedienteMap.get(a.expediente_id);
      return {
        id: a.id,
        codigo: a.folio ?? exp?.serie?.codigo ?? exp?.subSerie?.codigo ?? '—',
        nombre_ex: a.titulo,
        area: exp?.serie?.serie ?? exp?.subSerie?.subserie ?? '—',
        estado: a.tipo,
        fecha: a.fecha,
      };
    });
  }

  // GuiaController.expCerrados()
  async getCerrados(rfc: string) {
    return this.getExpedientesPorEstado(rfc, true);
  }

  // GuiaController.store() — crear expediente
  async crearExpediente(dto: {
    id_serie?: number;
    id_subserie?: number;
    nombre_ex: string;
    anio: string;
    id_tipo_expediente?: number;
    rfc_usuario_expediente?: string;
  }) {
    return this.expedienteModel.create({
      id_serie: dto.id_serie ?? null,
      id_subserie: dto.id_subserie ?? null,
      nombre_ex: dto.nombre_ex,
      anio: dto.anio,
      id_tipo_expediente: dto.id_tipo_expediente ?? null,
      rfc_usuario_expediente: dto.rfc_usuario_expediente ?? null,
      status: true,
    });
  }

  // Catálogo de tipos de tratamiento de expediente
  async getTiposTratamiento() {
    return this.tipoTratamientoModel.findAll({
      where: { status: true },
      order: [['tipo', 'ASC']],
    });
  }

  // Catálogo de servidores públicos activos (picker de "responsable de expediente")
  async getServidoresPublicos() {
    return this.sUsuarioModel.findAll({
      where: { Estado: 1 },
      order: [['Nombre', 'ASC']],
    });
  }

  // GuiaController.verExpediente() — detalle de expediente con documentos físicos/digitales
  async getExpedienteDetalle(id: number) {
    const expediente = await this.expedienteModel.findByPk(id, {
      include: [
        { model: SerieModel },
        { model: SubSerieModel },
        { model: TipoExpedienteTratamientoModel },
      ],
    });
    if (!expediente) throw new NotFoundException('Expediente no encontrado');

    let responsable: SUsuario | null = null;
    if (expediente.rfc_usuario_expediente) {
      responsable = await this.sUsuarioModel.findOne({
        where: { N_Usuario: expediente.rfc_usuario_expediente },
      });
    }

    let fechaTransferencia: Date | null = null;
    if (expediente.id_solicitud_transferencia) {
      const solicitud = await this.solicitudTransferenciaModel.findByPk(
        expediente.id_solicitud_transferencia,
      );
      fechaTransferencia = solicitud?.fecha_recepcion ?? null;
    }

    const [fisicos, digitalesRows, registrosDocs] = await Promise.all([
      this.registroFisicoModel.findAll({
        where: { expediente_id: id, status: true },
        order: [['folio', 'ASC']],
      }),
      this.registroModel.findAll({
        where: { expediente_id: id, status: true },
        order: [['folio', 'ASC']],
      }),
      this.registroDocsModel.findAll({
        where: { expediente_id: id, status: true },
        include: [{ model: TipoDocModel }],
        order: [['folio', 'ASC']],
      }),
    ]);

    // Registro.docs() — cada registro digital tiene sus propios documentos anidados (documentos_envios)
    const digitales = await Promise.all(
      digitalesRows.map(async (reg) => {
        const docs = await this.documentosEnvioModel.findAll({
          where: { registro_id: reg.id, status_doc: true },
          include: [{ model: TipoDocModel }],
          order: [['id', 'DESC']],
        });
        return { ...reg.get({ plain: true }), docs };
      }),
    );

    return {
      expediente: {
        id: expediente.id,
        nombre_ex: expediente.nombre_ex,
        anio: expediente.anio,
        fecha_cierre_exp: expediente.fecha_cierre_exp,
        fecha_transferencia: fechaTransferencia,
        status: expediente.status,
        id_serie: expediente.id_serie,
        id_subserie: expediente.id_subserie,
        id_tipo_expediente: expediente.id_tipo_expediente,
        rfc_usuario_expediente: expediente.rfc_usuario_expediente,
        serie_codigo: expediente.serie?.codigo ?? null,
        serie_nombre: expediente.serie?.serie ?? null,
        subserie_codigo: expediente.subSerie?.codigo ?? null,
        subserie_nombre: expediente.subSerie?.subserie ?? null,
      },
      tipoExpediente: expediente.tipoExpediente ?? null,
      responsable,
      fisicos,
      digitales,
      registrosDocs,
    };
  }

  // GuiaController.transferirExp() / updateExp()
  async transferirExpediente(
    id: number,
    dto: {
      nombre_ex?: string;
      anio?: string;
      id_tipo_expediente?: number | null;
      rfc_usuario_expediente?: string | null;
    },
  ) {
    const expediente = await this.expedienteModel.findByPk(id);
    if (!expediente) throw new NotFoundException('Expediente no encontrado');

    await expediente.update({
      nombre_ex: dto.nombre_ex ?? expediente.nombre_ex,
      anio: dto.anio ?? expediente.anio,
      id_tipo_expediente: dto.id_tipo_expediente ?? null,
      rfc_usuario_expediente: dto.rfc_usuario_expediente ?? null,
    });
    return this.getExpedienteDetalle(id);
  }

  // GuiaController.getDoc() — descarga de documento de registro_docs
  async getRutaDocumento(id: number): Promise<string> {
    const doc = await this.registroDocsModel.findByPk(id);
    if (!doc || !doc.get('path_doc'))
      throw new NotFoundException('Documento no encontrado');
    return this.resolverRutaArchivo(doc.get('path_doc') as string);
  }

  // GuiaController.getDocR() — descarga de documento de registro (digital)
  async getRutaDocumentoRegistro(id: number): Promise<string> {
    const registro = await this.registroModel.findByPk(id);
    if (!registro || !registro.get('path'))
      throw new NotFoundException('Documento no encontrado');
    return this.resolverRutaArchivo(registro.get('path') as string);
  }

  // Descarga de un documento anidado bajo un registro digital (documentos_envios)
  async getRutaDocumentoEnvio(id: number): Promise<string> {
    const doc = await this.documentosEnvioModel.findByPk(id);
    if (!doc || !doc.get('path'))
      throw new NotFoundException('Documento no encontrado');
    return this.resolverRutaArchivo(doc.get('path') as string);
  }

  private resolverRutaArchivo(relativePath: string): string {
    const base = process.env.DOCS_STORAGE_PATH;
    if (!base) {
      throw new NotFoundException('Archivo no disponible en este entorno');
    }
    const fullPath = join(base, relativePath);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Archivo no disponible en este entorno');
    }
    return fullPath;
  }

  // GuiaController.getIndexExpF() / getIndexExpE() — índices en PDF
  async getIndicePdf(
    id: number,
    tipo: 'fisico' | 'electronico',
  ): Promise<Buffer> {
    const detalle = await this.getExpedienteDetalle(id);
    const titulo =
      tipo === 'fisico'
        ? `Índice expediente físico ${detalle.expediente.nombre_ex} ${detalle.expediente.anio}`
        : `Índice expediente electrónico ${detalle.expediente.nombre_ex} ${detalle.expediente.anio}`;

    const items =
      tipo === 'fisico'
        ? detalle.fisicos.map(
            (f) => `${f.get('folio')} — ${f.get('titulo_doc') ?? ''}`,
          )
        : [
            ...detalle.digitales.map(
              (d) => `${d.folio} — ${d.titulo_doc ?? ''}`,
            ),
            ...detalle.registrosDocs.map((d) => {
              const folio = d.get('folio') ? `Folio: ${d.get('folio')}, ` : '';
              const tipoNombre = (d as any).tipo?.tipo_doc ?? '';
              const activo = d.get('status') ? 'Activo' : 'Cancelado';
              return `${folio}Documento: ${d.get('path_doc') ?? ''}, Tipo documento: ${tipoNombre}, Estatus: ${activo}`;
            }),
          ];

    const docDefinition = {
      content: [
        { text: titulo, style: 'header' },
        items.length
          ? { ul: items }
          : { text: 'Sin documentos registrados.', italics: true },
      ],
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

  // Rango de años (fechas extremas) de expedientes activos, agrupado por serie o subserie
  private async getFechasExtremas(
    campo: 'id_serie' | 'id_subserie',
    ids: number[],
  ) {
    const mapa = new Map<number, { min: string | null; max: string | null }>();
    if (!ids.length) return mapa;
    const filas = await this.expedienteModel.findAll({
      where: { [campo]: { [Op.in]: ids }, status: true },
      attributes: [
        campo,
        [fn('MIN', col('anio')), 'minAnio'],
        [fn('MAX', col('anio')), 'maxAnio'],
      ],
      group: [campo],
      raw: true,
    });
    for (const fila of filas as unknown as Record<string, string | null>[]) {
      mapa.set(Number(fila[campo]), { min: fila.minAnio, max: fila.maxAnio });
    }
    return mapa;
  }

  // Departamentos a cargo del RFC + nombre de su dependencia (para el encabezado institucional de los PDFs)
  private async getDeptosConDependencia(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    const departamentos = deptIds.length
      ? await this.departamentoModel.findAll({
          where: { id_Departamento: { [Op.in]: deptIds } },
        })
      : [];

    const dependenciaIds = [
      ...new Set(
        departamentos
          .map((d) => d.id_Dependencia)
          .filter((id): id is number => !!id),
      ),
    ];
    const dependencias = dependenciaIds.length
      ? await this.dependenciaModel.findAll({
          where: { id_Dependencia: { [Op.in]: dependenciaIds } },
        })
      : [];
    const dependenciaPorId = new Map(
      dependencias.map((d) => [d.id_Dependencia, d.nombre_completo]),
    );

    return { deptIds, departamentos, dependenciaPorId };
  }

  // GuiaController.guiaSimplePdf() — Anexo 1/0771 43031-F01-26 "Guía simple de archivos" (SAF), una página por departamento a cargo del RFC
  async getGuiaSimplePdf(rfc: string): Promise<Buffer> {
    const [{ departamentos, dependenciaPorId }, usuario, inventario] =
      await Promise.all([
        this.getDeptosConDependencia(rfc),
        this.sUsuarioModel.findOne({ where: { N_Usuario: rfc } }),
        this.getInventario(rfc),
      ]);

    const [fechasSerie, fechasSubserie] = await Promise.all([
      this.getFechasExtremas(
        'id_serie',
        inventario.map((s) => s.id),
      ),
      this.getFechasExtremas(
        'id_subserie',
        inventario.flatMap((s) => s.subseries.map((ss) => ss.id)),
      ),
    ]);

    const nombreUsuario = usuario
      ? capitalizar(
          [usuario.Nombre, usuario.A_Paterno, usuario.A_Materno]
            .filter(Boolean)
            .join(' '),
        )
      : '';

    const formatoRango = (rango?: {
      min: string | null;
      max: string | null;
    }) => {
      if (!rango || (!rango.min && !rango.max)) return '';
      return rango.min === rango.max
        ? (rango.min ?? '')
        : `${rango.min ?? ''} - ${rango.max ?? ''}`;
    };

    const etiqueta = (texto: string, numero: number) => ({
      text: [{ text: `${texto} ` }, { text: `(${numero})`, fontSize: 7 }],
      bold: true,
      fontSize: 11,
      fillColor: '#d8d8d8',
    });

    const grupos = new Map<
      number,
      { departamento: TDepartamento; series: typeof inventario }
    >();
    for (const serie of inventario) {
      if (serie.departamento_id == null) continue;
      if (!grupos.has(serie.departamento_id)) {
        const depto = departamentos.find(
          (d) => d.id_Departamento === serie.departamento_id,
        );
        if (!depto) continue;
        grupos.set(serie.departamento_id, { departamento: depto, series: [] });
      }
      grupos.get(serie.departamento_id)!.series.push(serie);
    }
    const paginas = grupos.size
      ? [...grupos.values()]
      : [
          {
            departamento: null as TDepartamento | null,
            series: [] as typeof inventario,
          },
        ];

    const content: Record<string, unknown>[] = [];
    paginas.forEach((pagina, idx) => {
      const depto = pagina.departamento;
      const dependenciaNombre = capitalizar(
        depto?.id_Dependencia
          ? (dependenciaPorId.get(depto.id_Dependencia) ?? '')
          : '',
      );
      const unidadNombre = capitalizar(depto?.nom_cap ?? depto?.Nombre ?? '');

      const valor = (texto: string) => ({ text: texto, fontSize: 11 });
      const filasInfo: [ReturnType<typeof etiqueta>, unknown][] = [
        [etiqueta('Fondo', 1), valor('Poder Legislativo del Estado de México')],
        [etiqueta('Dependencia', 2), valor(dependenciaNombre)],
        [etiqueta('Unidad administrativa', 3), valor(unidadNombre)],
        [
          etiqueta('Persona responsable de Archivo de Trámite', 4),
          valor(nombreUsuario),
        ],
        [etiqueta('Teléfono de oficina', 5), valor('')],
        [etiqueta('Correo electrónico', 6), valor('')],
        [etiqueta('Dirección de oficina', 7), valor('')],
      ];

      const filasTabla: unknown[][] = [
        [
          etiqueta('Código', 8),
          etiqueta('Serie/Subserie', 9),
          etiqueta('Cantidad de expedientes', 10),
          etiqueta('Cantidad de documentos', 11),
          etiqueta('Metros lineales', 12),
          etiqueta('Fechas extremas', 13),
          etiqueta('Ubicación física', 14),
        ],
      ];
      const filaDatos = (celdas: string[]) =>
        celdas.map((texto) => ({
          text: texto || ' ',
          fontSize: 10,
          margin: [0, 2, 0, 2] as [number, number, number, number],
        }));
      for (const serie of pagina.series) {
        filasTabla.push(
          filaDatos([
            serie.codigo,
            serie.serie,
            String(serie.total_expedientes),
            '',
            '',
            formatoRango(fechasSerie.get(serie.id)),
            '',
          ]),
        );
        for (const sub of serie.subseries) {
          filasTabla.push(
            filaDatos([
              sub.codigo,
              sub.subserie,
              String(sub.total_expedientes),
              '',
              '',
              formatoRango(fechasSubserie.get(sub.id)),
              '',
            ]),
          );
        }
      }
      while (filasTabla.length < 5) {
        filasTabla.push(filaDatos(['', '', '', '', '', '', '']));
      }

      // Medidas tomadas del PDF oficial (Letter horizontal, 792x612pt): logo 385x64,
      // barra de título 657x22.7 gris #a5a5a5, tabla de datos [170,487], tabla de series
      // [65,116,85,89,75,84,143] = 657pt, línea de firma 322.5pt por columna con gap 12pt.
      const anchoColSignat = (657 - 12) / 2;
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

      if (idx > 0) content.push({ text: '', pageBreak: 'before' });
      content.push(
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
                  text: 'GUÍA SIMPLE DE ARCHIVOS',
                  bold: true,
                  fontSize: 12,
                  alignment: 'center',
                  fillColor: '#a5a5a5',
                },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },
        {
          // pdfmake suma paddingLeft(4) + paddingRight(4) + bordes(1) = 9pt POR COLUMNA
          // por encima del ancho declarado, así que se resta 9 a cada columna para que
          // el ancho renderizado real sea 170/487 (suman los 657pt del área de contenido).
          table: {
            widths: [161, 478],
            body: filasInfo.map(([label, value]) => [label, value]),
          },
          margin: [0, 0, 0, 16],
        },
        {
          table: {
            headerRows: 1,
            widths: [81, 107, 76, 80, 66, 75, 109],
            body: filasTabla,
          },
          margin: [0, 0, 0, 24],
        },
        {
          columns: [
            {
              width: anchoColSignat,
              alignment: 'center',
              stack: [
                {
                  text: [
                    { text: 'Elaboró ', bold: true, fontSize: 11 },
                    { text: '(15)', fontSize: 7 },
                  ],
                },
                {
                  text: nombreUsuario,
                  bold: true,
                  fontSize: 11,
                  margin: [0, 18, 0, 2],
                },
                lineaFirma(),
                {
                  text: 'Persona responsable de Archivo de Trámite\nNombre y firma',
                  bold: true,
                  fontSize: 11,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
            {
              width: anchoColSignat,
              alignment: 'center',
              stack: [
                {
                  text: [
                    { text: 'Autorizó ', bold: true, fontSize: 11 },
                    { text: '(16)', fontSize: 7 },
                  ],
                },
                { text: '', margin: [0, 20, 0, 2] },
                lineaFirma(),
                {
                  text: 'Persona titular de la Unidad Administrativa\nNombre y firma',
                  bold: true,
                  fontSize: 11,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
          columnGap: 12,
        },
        {
          text: 'Anexo 1/0771 43031-F01-26',
          alignment: 'right',
          bold: true,
          fontSize: 7,
          margin: [0, 9, 0, 0],
        },
      );
    });

    const docDefinition = {
      pageSize: 'LETTER' as const,
      pageOrientation: 'landscape' as const,
      pageMargins: [71, 20, 64, 20] as [number, number, number, number],
      content,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // GuiaController.inventarioGeneralPdf() — Anexo 2/0772 43031-F02-26 "Inventario general de Archivo de Trámite" (SAF), una página (hoja) por departamento a cargo del RFC
  async getInventarioGeneralPdf(rfc: string): Promise<Buffer> {
    const [{ departamentos, dependenciaPorId }, usuario] = await Promise.all([
      this.getDeptosConDependencia(rfc),
      this.sUsuarioModel.findOne({ where: { N_Usuario: rfc } }),
    ]);

    const nombreUsuario = usuario
      ? capitalizar(
          [usuario.Nombre, usuario.A_Paterno, usuario.A_Materno]
            .filter(Boolean)
            .join(' '),
        )
      : '';

    const hoy = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fechaElaboracion = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
    const formatoMesAnio = (fecha: unknown): string => {
      if (!fecha) return '';
      const d = new Date(fecha as string);
      if (Number.isNaN(d.getTime())) return '';
      return `${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };

    const paginas: (TDepartamento | null)[] = departamentos.length
      ? departamentos
      : [null];

    // Mismas medidas de firma que la Guía Simple: son el mismo widget institucional reutilizado.
    const anchoColSignat = (657 - 12) / 2;
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

    const etiquetaChica = (texto: string, numero: number) => ({
      text: [
        { text: `${texto} `, bold: true },
        { text: `(${numero})`, fontSize: 6 },
      ],
      fontSize: 7,
      fillColor: '#d8d8d8',
    });

    const content: Record<string, unknown>[] = [];
    for (let idx = 0; idx < paginas.length; idx++) {
      const depto = paginas[idx];
      const dependenciaNombre = capitalizar(
        depto?.id_Dependencia
          ? (dependenciaPorId.get(depto.id_Dependencia) ?? '')
          : '',
      );
      const unidadNombre = capitalizar(depto?.nom_cap ?? depto?.Nombre ?? '');

      const filaDatos = (celdas: string[]) =>
        celdas.map((texto) => ({
          text: texto || ' ',
          fontSize: 8,
          margin: [0, 1, 0, 1] as [number, number, number, number],
        }));

      const filasTabla: unknown[][] = [
        [
          { ...etiquetaChica('N.P.', 5), rowSpan: 2 },
          { ...etiquetaChica('Serie / subserie', 6), rowSpan: 2 },
          { ...etiquetaChica('Código de clasificación', 7), rowSpan: 2 },
          { ...etiquetaChica('Nombre del expediente', 8), rowSpan: 2 },
          { ...etiquetaChica('Total de legajos', 9), rowSpan: 2 },
          { ...etiquetaChica('Total de documentos', 10), rowSpan: 2 },
          {
            text: 'Fechas extremas',
            bold: true,
            fontSize: 7,
            colSpan: 2,
            alignment: 'center',
            fillColor: '#d8d8d8',
          },
          {},
        ],
        [
          '',
          '',
          '',
          '',
          '',
          '',
          etiquetaChica('Primera', 11),
          etiquetaChica('Última', 12),
        ],
      ];

      if (depto) {
        const [series, subseries] = await Promise.all([
          this.serieModel.findAll({
            where: { departamento_id: depto.id_Departamento },
            attributes: ['id'],
          }),
          this.subSerieModel.findAll({
            where: { id_Departamento: depto.id_Departamento },
            attributes: ['id'],
          }),
        ]);
        const serieIds = series.map((s) => s.id);
        const subserieIds = subseries.map((s) => s.id);
        const condiciones: Record<string, unknown>[] = [];
        if (serieIds.length)
          condiciones.push({ id_serie: { [Op.in]: serieIds } });
        if (subserieIds.length)
          condiciones.push({ id_subserie: { [Op.in]: subserieIds } });

        const expedientes = condiciones.length
          ? await this.expedienteModel.findAll({
              where: { [Op.or]: condiciones, status: true },
              include: [{ model: SerieModel }, { model: SubSerieModel }],
              order: [['created_at', 'ASC']],
            })
          : [];

        expedientes.forEach((e, i) => {
          filasTabla.push(
            filaDatos([
              String(i + 1),
              e.serie?.serie ?? e.subSerie?.subserie ?? '',
              e.serie?.codigo ?? e.subSerie?.codigo ?? '',
              e.nombre_ex,
              '',
              '',
              formatoMesAnio(e.get('created_at')),
              formatoMesAnio(e.fecha_cierre_exp),
            ]),
          );
        });
      }
      if (filasTabla.length === 2) {
        filasTabla.push(filaDatos(['', '', '', '', '', '', '', '']));
      }

      if (idx > 0) content.push({ text: '', pageBreak: 'before' });
      content.push(
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
            widths: ['*', 91],
            body: [
              [
                {
                  text: 'INVENTARIO GENERAL DE ARCHIVO DE TRÁMITE',
                  bold: true,
                  fontSize: 10,
                  alignment: 'center',
                  fillColor: '#a5a5a5',
                },
                {
                  text: [
                    { text: '(1) ', fontSize: 6 },
                    {
                      text: `HOJA ${idx + 1} DE ${paginas.length}`,
                      fontSize: 8,
                      bold: true,
                    },
                  ],
                  alignment: 'center',
                  fillColor: '#a5a5a5',
                },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: [96, 425, 129],
            body: [
              [
                { text: 'Dependencia:', bold: true, fontSize: 8 },
                { text: dependenciaNombre, fontSize: 9 },
                {
                  alignment: 'center',
                  text: [
                    { text: 'Fecha de elaboración ', bold: true, fontSize: 7 },
                    { text: '(4)', fontSize: 6 },
                  ],
                },
              ],
              [
                { text: 'Unidad administrativa:', bold: true, fontSize: 8 },
                { text: unidadNombre, fontSize: 9 },
                {
                  text: fechaElaboracion,
                  bold: true,
                  fontSize: 9,
                  alignment: 'center',
                },
              ],
            ],
          },
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 2,
            widths: [15, 64, 86, 251, 37, 61, 46, 43],
            body: filasTabla,
          },
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              width: anchoColSignat,
              alignment: 'center',
              stack: [
                {
                  text: [
                    { text: 'Elaboró ', bold: true, fontSize: 11 },
                    { text: '(13)', fontSize: 7 },
                  ],
                },
                {
                  text: nombreUsuario,
                  bold: true,
                  fontSize: 11,
                  margin: [0, 18, 0, 2],
                },
                lineaFirma(),
                {
                  text: 'Persona responsable de Archivo de Trámite\nNombre y firma',
                  bold: true,
                  fontSize: 11,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
            {
              width: anchoColSignat,
              alignment: 'center',
              stack: [
                {
                  text: [
                    { text: 'Autorizó ', bold: true, fontSize: 11 },
                    { text: '(14)', fontSize: 7 },
                  ],
                },
                { text: '', margin: [0, 20, 0, 2] },
                lineaFirma(),
                {
                  text: 'Persona titular de la Unidad Administrativa\nNombre y firma',
                  bold: true,
                  fontSize: 11,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
          ],
          columnGap: 12,
        },
        {
          text: 'Anexo 2/0772 43031-F02-26',
          alignment: 'right',
          bold: true,
          fontSize: 7,
          margin: [0, 9, 0, 0],
        },
      );
    }

    const docDefinition = {
      pageSize: 'LETTER' as const,
      pageOrientation: 'landscape' as const,
      pageMargins: [57, 20, 57, 20] as [number, number, number, number],
      content,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // GuiaController.relacionBajaPdf() — Anexo 5/0774 43031-F04-26 "Relación de documentos desincorporados susceptibles a baja documental en Archivo de Trámite" (SAF)
  // A diferencia de los otros formatos, este no lleva Dependencia/Unidad administrativa — es una sola hoja por RFC, no por departamento.
  async getRelacionBajaPdf(rfc: string): Promise<Buffer> {
    const usuario = await this.sUsuarioModel.findOne({
      where: { N_Usuario: rfc },
    });
    const nombreUsuario = usuario
      ? capitalizar(
          [usuario.Nombre, usuario.A_Paterno, usuario.A_Materno]
            .filter(Boolean)
            .join(' '),
        )
      : '';

    const etiquetaChica = (texto: string, rowSpan?: number) => ({
      text: texto,
      bold: true,
      fontSize: 8,
      alignment: 'center' as const,
      fillColor: '#d8d8d8',
      ...(rowSpan ? { rowSpan } : {}),
    });
    const numeroChico = (n: number) => ({
      text: `(${n})`,
      fontSize: 7,
      alignment: 'center' as const,
    });

    const filasTabla: unknown[][] = [
      [
        etiquetaChica('Documentos Identificados', 2),
        etiquetaChica('Descripción conforme al CADIDO', 2),
        etiquetaChica('Periodos', 2),
        etiquetaChica('Cantidad de Documentos', 2),
        etiquetaChica('Cantidad de Cajas', 2),
        {
          text: 'Tipo de soporte',
          bold: true,
          fontSize: 8,
          colSpan: 2,
          alignment: 'center',
          fillColor: '#d8d8d8',
        },
        {},
      ],
      [
        '',
        '',
        '',
        '',
        '',
        etiquetaChica('Convencional'),
        etiquetaChica('No convencional'),
      ],
      [
        numeroChico(1),
        numeroChico(2),
        numeroChico(3),
        numeroChico(4),
        numeroChico(5),
        numeroChico(6),
        numeroChico(6),
      ],
    ];
    for (let i = 0; i < 10; i++) {
      filasTabla.push(
        ['', '', '', '', '', '', ''].map((t) => ({
          text: t || ' ',
          fontSize: 8,
          margin: [0, 2, 0, 2],
        })),
      );
    }
    filasTabla.push([
      '',
      '',
      { text: 'TOTAL:', bold: true, fontSize: 8, alignment: 'right' },
      { text: '(7)', fontSize: 7, alignment: 'center' },
      { text: '(7)', fontSize: 7, alignment: 'center' },
      '',
      '',
    ]);

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
                text: 'RELACIÓN DE DOCUMENTOS DESINCORPORADOS SUSCEPTIBLES A BAJA DOCUMENTAL EN ARCHIVO DE TRÁMITE',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                fillColor: '#a5a5a5',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 3,
          widths: [116, 128, 94, 55, 53, 55, 99],
          body: filasTabla,
        },
        margin: [0, 0, 0, 30],
      },
      {
        columns: [
          {
            width: 250,
            alignment: 'center',
            stack: [
              {
                text: nombreUsuario || ' ',
                bold: true,
                fontSize: 9,
                margin: [0, 0, 0, 2],
              },
              { text: 'NOMBRE Y FIRMA', bold: true, fontSize: 7 },
              {
                text: 'Persona responsable de Archivo de Trámite de la unidad administrativa generadora de la documentación',
                bold: true,
                fontSize: 7,
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            width: 250,
            alignment: 'center',
            stack: [
              { text: ' ', margin: [0, 0, 0, 2] },
              { text: 'NOMBRE Y FIRMA', bold: true, fontSize: 7 },
              {
                text: 'Persona titular de la unidad administrativa generadora de la documentación',
                bold: true,
                fontSize: 7,
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
        columnGap: 100,
      },
      {
        text: 'Anexo 5/0774 43031-F04-26',
        alignment: 'right',
        bold: true,
        fontSize: 7,
        margin: [0, 20, 0, 0],
      },
    ];

    const docDefinition = {
      pageSize: 'LETTER' as const,
      pageOrientation: 'landscape' as const,
      pageMargins: [71, 20, 54, 20] as [number, number, number, number],
      content,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // GuiaController.cerrarExp()
  async cerrarExpediente(id: number) {
    const expediente = await this.expedienteModel.findByPk(id);
    if (!expediente) throw new NotFoundException('Expediente no encontrado');
    await expediente.update({
      fecha_cierre_exp: new Date().toISOString().slice(0, 10),
    });
    return { ok: true };
  }

  // Obtener datos de una serie (para el encabezado del detalle)
  async getSerie(id: number) {
    const serie = await this.serieModel.findByPk(id, {
      attributes: ['id', 'codigo', 'serie'],
    });
    return serie ?? null;
  }

  // Obtener datos de una subserie
  async getSubserie(id: number) {
    const subserie = await this.subSerieModel.findByPk(id, {
      include: [{ model: SerieModel }],
    });
    if (!subserie) return null;
    return {
      id: subserie.id,
      codigo: subserie.codigo,
      subserie: subserie.subserie,
      idSerie: subserie.idSerie,
      serie_codigo: subserie.serie?.codigo ?? null,
      serie_nombre: subserie.serie?.serie ?? null,
    };
  }
}
