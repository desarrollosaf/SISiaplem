import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
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
import { SUsuario } from '../models/s-usuario.model';

pdfMake.setFonts({
  Roboto: {
    normal: require.resolve('pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: require.resolve('pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: require.resolve('pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics: require.resolve('pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'),
  },
});

@Injectable()
export class GuiaService {
  constructor(
    @InjectModel(ResponsableArchivoModel) private responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(SerieModel) private serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel) private subSerieModel: typeof SubSerieModel,
    @InjectModel(ExpedienteSerieSubseModel) private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(RegistroModel) private registroModel: typeof RegistroModel,
    @InjectModel(RegistroDocsModel) private registroDocsModel: typeof RegistroDocsModel,
    @InjectModel(RegistroFisicoModel) private registroFisicoModel: typeof RegistroFisicoModel,
    @InjectModel(DocumentosEnvioModel) private documentosEnvioModel: typeof DocumentosEnvioModel,
    @InjectModel(TipoExpedienteTratamientoModel) private tipoTratamientoModel: typeof TipoExpedienteTratamientoModel,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
  ) {}

  private async getDeptIds(rfc: string): Promise<number[]> {
    const responsables = await this.responsableModel.findAll({
      where: { rfc_responsable: rfc, status: true },
      attributes: ['id_Departamento'],
    });
    return responsables.map((r) => r.get('id_Departamento') as number);
  }

  // Guia.index() — series del usuario con subseries y conteo de expedientes
  async getInventario(rfc: string) {
    const deptIds = await this.getDeptIds(rfc);
    if (!deptIds.length) return [];

    const series = await this.serieModel.findAll({
      where: { departamento_id: { [Op.in]: deptIds }, status: 1 },
      order: [['codigo', 'ASC']],
    });

    const result: {
      id: number; codigo: string; serie: string; total_expedientes: number;
      subseries: { id: number; codigo: string; subserie: string; total_expedientes: number }[];
    }[] = [];
    for (const serie of series) {
      const total_expedientes = await this.expedienteModel.count({ where: { id_serie: serie.id, status: true } });
      const subseriesModels = await this.subSerieModel.findAll({
        where: { idSerie: serie.id, status: 1 },
        order: [['codigo', 'ASC']],
      });
      const subseries = await Promise.all(subseriesModels.map(async (ss) => ({
        id: ss.id,
        codigo: ss.codigo,
        subserie: ss.subserie,
        total_expedientes: await this.expedienteModel.count({ where: { id_subserie: ss.id, status: true } }),
      })));
      result.push({ id: serie.id, codigo: serie.codigo, serie: serie.serie, total_expedientes, subseries });
    }
    return result;
  }

  // GuiaController.expedienteSerie() — expedientes de una serie
  async getExpedientesSerie(id: number) {
    return this.expedienteModel.findAll({
      where: { id_serie: id, status: true },
      order: [['anio', 'DESC'], ['nombre_ex', 'ASC']],
    });
  }

  // GuiaController.expedienteSerieSub() — expedientes de una subserie
  async getExpedientesSubserie(id: number) {
    return this.expedienteModel.findAll({
      where: { id_subserie: id, status: true },
      order: [['anio', 'DESC'], ['nombre_ex', 'ASC']],
    });
  }

  private async getExpedientesPorEstado(rfc: string, cerrados: boolean) {
    const deptIds = await this.getDeptIds(rfc);
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
        status: true,
        fecha_cierre_exp: cerrados ? { [Op.ne]: null } : null,
      },
      include: [{ model: SerieModel }, { model: SubSerieModel }],
      order: cerrados ? [['fecha_cierre_exp', 'DESC']] : [['created_at', 'DESC']],
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

    archivos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

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
    return this.tipoTratamientoModel.findAll({ where: { status: true }, order: [['tipo', 'ASC']] });
  }

  // Catálogo de servidores públicos activos (picker de "responsable de expediente")
  async getServidoresPublicos() {
    return this.sUsuarioModel.findAll({ where: { Estado: 1 }, order: [['Nombre', 'ASC']] });
  }

  // GuiaController.verExpediente() — detalle de expediente con documentos físicos/digitales
  async getExpedienteDetalle(id: number) {
    const expediente = await this.expedienteModel.findByPk(id, {
      include: [{ model: SerieModel }, { model: SubSerieModel }, { model: TipoExpedienteTratamientoModel }],
    });
    if (!expediente) throw new NotFoundException('Expediente no encontrado');

    let responsable: SUsuario | null = null;
    if (expediente.rfc_usuario_expediente) {
      responsable = await this.sUsuarioModel.findOne({ where: { N_Usuario: expediente.rfc_usuario_expediente } });
    }

    const [fisicos, digitalesRows, registrosDocs] = await Promise.all([
      this.registroFisicoModel.findAll({ where: { expediente_id: id, status: true }, order: [['folio', 'ASC']] }),
      this.registroModel.findAll({ where: { expediente_id: id, status: true }, order: [['folio', 'ASC']] }),
      this.registroDocsModel.findAll({
        where: { expediente_id: id, status: true },
        include: [{ model: TipoDocModel }],
        order: [['folio', 'ASC']],
      }),
    ]);

    // Registro.docs() — cada registro digital tiene sus propios documentos anidados (documentos_envios)
    const digitales = await Promise.all(digitalesRows.map(async (reg) => {
      const docs = await this.documentosEnvioModel.findAll({
        where: { registro_id: reg.id, status_doc: true },
        include: [{ model: TipoDocModel }],
        order: [['id', 'DESC']],
      });
      return { ...reg.get({ plain: true }), docs };
    }));

    return {
      expediente: {
        id: expediente.id,
        nombre_ex: expediente.nombre_ex,
        anio: expediente.anio,
        fecha_cierre_exp: expediente.fecha_cierre_exp,
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
  async transferirExpediente(id: number, dto: {
    nombre_ex?: string;
    anio?: string;
    id_tipo_expediente?: number | null;
    rfc_usuario_expediente?: string | null;
  }) {
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
    if (!doc || !doc.get('path_doc')) throw new NotFoundException('Documento no encontrado');
    return this.resolverRutaArchivo(doc.get('path_doc') as string);
  }

  // GuiaController.getDocR() — descarga de documento de registro (digital)
  async getRutaDocumentoRegistro(id: number): Promise<string> {
    const registro = await this.registroModel.findByPk(id);
    if (!registro || !registro.get('path')) throw new NotFoundException('Documento no encontrado');
    return this.resolverRutaArchivo(registro.get('path') as string);
  }

  // Descarga de un documento anidado bajo un registro digital (documentos_envios)
  async getRutaDocumentoEnvio(id: number): Promise<string> {
    const doc = await this.documentosEnvioModel.findByPk(id);
    if (!doc || !doc.get('path')) throw new NotFoundException('Documento no encontrado');
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
  async getIndicePdf(id: number, tipo: 'fisico' | 'electronico'): Promise<Buffer> {
    const detalle = await this.getExpedienteDetalle(id);
    const titulo = tipo === 'fisico'
      ? `Índice expediente físico ${detalle.expediente.nombre_ex} ${detalle.expediente.anio}`
      : `Índice expediente electrónico ${detalle.expediente.nombre_ex} ${detalle.expediente.anio}`;

    const items = tipo === 'fisico'
      ? detalle.fisicos.map((f) => `${f.get('folio')} — ${f.get('titulo_doc') ?? ''}`)
      : [
          ...detalle.digitales.map((d) => `${d.folio} — ${d.titulo_doc ?? ''}`),
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
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 12] as [number, number, number, number] },
      },
      defaultStyle: { font: 'Roboto' },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // GuiaController.cerrarExp()
  async cerrarExpediente(id: number) {
    const expediente = await this.expedienteModel.findByPk(id);
    if (!expediente) throw new NotFoundException('Expediente no encontrado');
    await expediente.update({ fecha_cierre_exp: new Date().toISOString().slice(0, 10) });
    return { ok: true };
  }

  // Obtener datos de una serie (para el encabezado del detalle)
  async getSerie(id: number) {
    const serie = await this.serieModel.findByPk(id, { attributes: ['id', 'codigo', 'serie'] });
    return serie ?? null;
  }

  // Obtener datos de una subserie
  async getSubserie(id: number) {
    const subserie = await this.subSerieModel.findByPk(id, { include: [{ model: SerieModel }] });
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
