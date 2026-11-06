import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import pdfMake = require('pdfmake');
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { DestinoFinalModel } from '../models/destino_final.model';
import { SUsuario } from '../models/s-usuario.model';
import { TDepartamento } from '../models/t-departamento.model';
import { TDependencia } from '../models/t-dependencia.model';
import {
  HEADER_LOGO_BASE64,
  bloqueFirmas,
  capitalizar,
  formatoDDMMAAAA,
  formatoMMAAAA,
} from '../common/pdf-utils';

pdfMake.setFonts({
  Roboto: {
    normal: require.resolve('pdfmake/fonts/Roboto/Roboto-Regular.ttf'),
    bold: require.resolve('pdfmake/fonts/Roboto/Roboto-Medium.ttf'),
    italics: require.resolve('pdfmake/fonts/Roboto/Roboto-Italic.ttf'),
    bolditalics:
      require.resolve('pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf'),
  },
});

interface ExpedienteConcentracion {
  id: number;
  nombre_ex: string;
  anio: string;
  fecha_cierre_exp: string | null;
  created_at: unknown;
  codigo: string;
  nombreSerie: string;
  anios_consentracion: number | null;
  destino: string | null;
  unidadAdministrativa: string;
  dependencia: string;
}

@Injectable()
export class ConcentracionService {
  constructor(
    @InjectModel(ExpedienteSerieSubseModel)
    private expedienteModel: typeof ExpedienteSerieSubseModel,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
    @InjectModel(TDepartamento, 'saf')
    private departamentoModel: typeof TDepartamento,
    @InjectModel(TDependencia, 'saf')
    private dependenciaModel: typeof TDependencia,
  ) {}

  // Expedientes que ya están físicamente en custodia del Archivo de Concentración
  // (recibidos vía transferencia primaria — mismo criterio que TransferenciasService.recibir()).
  private async getExpedientesEnConcentracion(): Promise<
    ExpedienteConcentracion[]
  > {
    const expedientes = await this.expedienteModel.findAll({
      where: { id_solicitud_transferencia: { [Op.ne]: null }, status: false },
      include: [
        { model: SerieModel, include: [{ model: DestinoFinalModel }] },
        { model: SubSerieModel, include: [{ model: DestinoFinalModel }] },
      ],
      order: [['updated_at', 'DESC']],
    });

    const deptIds = [
      ...new Set(
        expedientes
          .map((e) => e.serie?.departamento_id ?? e.subSerie?.id_Departamento)
          .filter((id): id is number => !!id),
      ),
    ];
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
    const departamentoPorId = new Map(
      departamentos.map((d) => [d.id_Departamento, d]),
    );
    const dependenciaPorId = new Map(
      dependencias.map((d) => [d.id_Dependencia, d.nombre_completo]),
    );

    return expedientes.map((e) => {
      const deptId = e.serie?.departamento_id ?? e.subSerie?.id_Departamento;
      const depto = deptId ? departamentoPorId.get(deptId) : undefined;
      return {
        id: e.id,
        nombre_ex: e.nombre_ex,
        anio: e.anio,
        fecha_cierre_exp: e.fecha_cierre_exp,
        created_at: e.get('created_at'),
        codigo: e.serie?.codigo ?? e.subSerie?.codigo ?? '',
        nombreSerie: e.serie?.serie ?? e.subSerie?.subserie ?? '',
        anios_consentracion:
          e.serie?.anios_consentracion ??
          e.subSerie?.anios_consentracion ??
          null,
        destino: e.serie?.destino?.valor ?? e.subSerie?.destino?.valor ?? null,
        unidadAdministrativa: capitalizar(
          depto?.nom_cap ?? depto?.Nombre ?? '',
        ),
        dependencia: capitalizar(
          depto?.id_Dependencia
            ? (dependenciaPorId.get(depto.id_Dependencia) ?? '')
            : '',
        ),
      };
    });
  }

  private async getNombreUsuario(rfc: string): Promise<string> {
    const usuario = await this.sUsuarioModel.findOne({
      where: { N_Usuario: rfc },
    });
    return usuario
      ? capitalizar(
          [usuario.Nombre, usuario.A_Paterno, usuario.A_Materno]
            .filter(Boolean)
            .join(' '),
        )
      : '';
  }

  private etiquetaChica(texto: string, rowSpan?: number) {
    return {
      text: texto,
      bold: true,
      fontSize: 7,
      alignment: 'center' as const,
      fillColor: '#d8d8d8',
      ...(rowSpan ? { rowSpan } : {}),
    };
  }

  private filaDatos(celdas: string[]) {
    return celdas.map((texto) => ({
      text: texto || ' ',
      fontSize: 7,
      alignment: 'center' as const,
      margin: [0, 1, 0, 1] as [number, number, number, number],
    }));
  }

  private encabezado(titulo: string, fontSize = 9) {
    return [
      HEADER_LOGO_BASE64
        ? {
            image: HEADER_LOGO_BASE64,
            width: 385,
            height: 64,
            alignment: 'center' as const,
            margin: [0, 0, 0, 7] as [number, number, number, number],
          }
        : {
            text: 'Coordinación de Normatividad, Desarrollo Administrativo y de Archivos\nUnidad Coordinadora de Gestión Documental y Administración de Archivos',
            alignment: 'center' as const,
            fontSize: 8,
            margin: [0, 20, 0, 14] as [number, number, number, number],
          },
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: titulo,
                bold: true,
                fontSize,
                alignment: 'center' as const,
                fillColor: '#a5a5a5',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },
    ];
  }

  private pie(anexo: string) {
    return {
      text: anexo,
      alignment: 'right' as const,
      bold: true,
      fontSize: 7,
      margin: [0, 20, 0, 0] as [number, number, number, number],
    };
  }

  private documento(
    content: unknown[],
    pageMargins: [number, number, number, number],
  ) {
    const docDefinition = {
      pageSize: 'LETTER' as const,
      pageOrientation: 'landscape' as const,
      pageMargins,
      content,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
    };
    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    return pdfDoc.getBuffer();
  }

  // Anexo 14/0780 43031-F10-26 — Inventario de baja documental en Archivo de Concentración
  async getBajaDocumentalPdf(rfc: string): Promise<Buffer> {
    const [nombreUsuario, expedientes] = await Promise.all([
      this.getNombreUsuario(rfc),
      this.getExpedientesEnConcentracion(),
    ]);

    const filasTabla: unknown[][] = [
      [
        this.etiquetaChica('NÚM.'),
        this.etiquetaChica('CÓDIGO DE CLASIFICACIÓN'),
        this.etiquetaChica('NOMBRE DE LA SERIE / SUBSERIE'),
        this.etiquetaChica('NÚM. DICTAMEN'),
        this.etiquetaChica('UNIDAD ADMINISTRATIVA'),
        this.etiquetaChica('DEPENDENCIA'),
        this.etiquetaChica('NOMBRE DEL EXPEDIENTE'),
        this.etiquetaChica('NÚM. DE FOJAS'),
        {
          text: 'FECHAS EXTREMAS',
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
        '',
        '',
        this.etiquetaChica('APERTURA'),
        this.etiquetaChica('CIERRE'),
      ],
    ];
    expedientes.forEach((e, i) => {
      filasTabla.push(
        this.filaDatos([
          String(i + 1),
          e.codigo,
          e.nombreSerie,
          '',
          e.unidadAdministrativa,
          e.dependencia,
          e.nombre_ex,
          '',
          formatoMMAAAA(e.created_at as string),
          formatoMMAAAA(e.fecha_cierre_exp),
        ]),
      );
    });
    if (filasTabla.length === 2) {
      filasTabla.push(this.filaDatos(['', '', '', '', '', '', '', '', '', '']));
    }

    const anios = expedientes
      .map((e) => Number(e.anio))
      .filter((n) => !Number.isNaN(n));
    const rangoAnios = anios.length
      ? `${Math.min(...anios)}-${Math.max(...anios)}`
      : '____';

    const content: unknown[] = [
      ...this.encabezado(
        'INVENTARIO DE BAJA DOCUMENTAL EN ARCHIVO DE CONCENTRACIÓN',
      ),
      {
        table: {
          headerRows: 2,
          widths: [24, 69, 67, 40, 90, 69, 99, 33, 50, 58],
          body: filasTabla,
        },
        margin: [0, 0, 0, 14],
      },
      {
        text: `El presente inventario consta de ____ fojas y ampara la cantidad de ${expedientes.length || '____'} expedientes, de los años ${rangoAnios} contenidos en ____, con un peso aproximado de _________.`,
        fontSize: 9,
        margin: [0, 0, 0, 24],
      },
      bloqueFirmas(
        [
          {
            etiqueta: 'ELABORÓ',
            nombre: nombreUsuario,
            caption: 'Persona responsable del Archivo de Concentración',
          },
          {
            etiqueta: 'REVISÓ',
            caption:
              'Persona titular de la Unidad Coordinadora de Gestión Documental y Administración de Archivos',
          },
          {
            etiqueta: 'APROBÓ',
            caption:
              'Persona titular de la Coordinación de Normatividad, Desarrollo Administrativo y de Archivos',
          },
        ],
        10,
      ),
      this.pie('Anexo 14/0780 43031-F10-26'),
    ];

    return this.documento(content, [49, 20, 54, 20]);
  }

  // Anexo 11/0777 43031-F07-26 — Inventario general de Archivo de Concentración
  async getInventarioGeneralPdf(rfc: string): Promise<Buffer> {
    const [nombreUsuario, expedientes] = await Promise.all([
      this.getNombreUsuario(rfc),
      this.getExpedientesEnConcentracion(),
    ]);

    const filasTabla: unknown[][] = [
      [
        this.etiquetaChica('CAJA', 2),
        this.etiquetaChica('NÚM. OFICIO', 2),
        this.etiquetaChica('FECHA DE OFICIO', 2),
        this.etiquetaChica('UNIDAD ADMIN.', 2),
        this.etiquetaChica('DEPENDENCIA', 2),
        this.etiquetaChica('NOMBRE DEL EXPEDIENTE', 2),
        this.etiquetaChica('PERIODO', 2),
        this.etiquetaChica('DESCRIPCIÓN DEL EXPEDIENTE', 2),
        this.etiquetaChica('NÚM. DE FOJAS', 2),
        {
          text: 'DISPOSICIÓN DOCUMENTAL',
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
        '',
        this.etiquetaChica('ELIMINACIÓN'),
        this.etiquetaChica('MUESTREO'),
        this.etiquetaChica('CONSERVACIÓN'),
      ],
    ];
    expedientes.forEach((e) => {
      filasTabla.push(
        this.filaDatos([
          '',
          '',
          '',
          e.unidadAdministrativa,
          e.dependencia,
          e.nombre_ex,
          e.anio,
          '',
          '',
          '',
          '',
          '',
        ]),
      );
    });
    if (filasTabla.length === 2) {
      filasTabla.push(
        this.filaDatos(['', '', '', '', '', '', '', '', '', '', '', '']),
      );
    }

    const content: unknown[] = [
      ...this.encabezado('INVENTARIO GENERAL DE ARCHIVO DE CONCENTRACIÓN'),
      {
        table: {
          headerRows: 2,
          widths: [19, 33, 40, 65, 61, 92, 33, 74, 40, 40, 37, 47],
          body: filasTabla,
        },
        margin: [0, 0, 0, 24],
      },
      bloqueFirmas(
        [
          {
            etiqueta: 'ACTUALIZÓ',
            nombre: nombreUsuario,
            caption: 'Persona responsable de Archivo de Concentración',
          },
          {
            etiqueta: 'VALIDÓ',
            caption:
              'Persona titular de la Unidad Coordinadora de Gestión Documental y Administración de Archivos',
          },
        ],
        7,
      ),
      this.pie('Anexo 11/0777 43031-F07-26'),
    ];

    return this.documento(content, [49, 20, 54, 20]);
  }

  // Anexo 18/0781 43031-F11-26 — Inventario de transferencia secundaria (Concentración → Archivo Histórico)
  async getTransferenciaSecundariaPdf(rfc: string): Promise<Buffer> {
    const [nombreUsuario, expedientes] = await Promise.all([
      this.getNombreUsuario(rfc),
      this.getExpedientesEnConcentracion(),
    ]);

    const filasTabla: unknown[][] = [
      [
        this.etiquetaChica('NÚM.', 2),
        this.etiquetaChica('CÓDIGO DE SERIE', 2),
        this.etiquetaChica('NOMBRE DE LA SERIE', 2),
        this.etiquetaChica('NOMBRE DEL EXPEDIENTE', 2),
        this.etiquetaChica('DESCRIPCIÓN DEL EXPEDIENTE', 2),
        this.etiquetaChica('NÚMERO DE FOJAS', 2),
        this.etiquetaChica('NÚMERO DE LEGAJOS', 2),
        {
          text: 'PERIODO DE TRÁMITE DEL EXPEDIENTE',
          bold: true,
          fontSize: 7,
          colSpan: 2,
          alignment: 'center',
          fillColor: '#d8d8d8',
        },
        {},
        {
          text: 'TÉCNICA DE CONSERVACIÓN',
          bold: true,
          fontSize: 7,
          colSpan: 2,
          alignment: 'center',
          fillColor: '#d8d8d8',
        },
        {},
        this.etiquetaChica('OBSERVACIONES', 2),
      ],
      [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        this.etiquetaChica('FECHA DE APERTURA'),
        this.etiquetaChica('FECHA DE CIERRE'),
        this.etiquetaChica('CONS.'),
        this.etiquetaChica('MUEST.'),
        '',
      ],
    ];
    expedientes.forEach((e, i) => {
      filasTabla.push(
        this.filaDatos([
          String(i + 1),
          e.codigo,
          e.nombreSerie,
          e.nombre_ex,
          '',
          '',
          '',
          formatoDDMMAAAA(e.created_at as string),
          formatoDDMMAAAA(e.fecha_cierre_exp),
          '',
          '',
          '',
        ]),
      );
    });
    if (filasTabla.length === 2) {
      filasTabla.push(
        this.filaDatos(['', '', '', '', '', '', '', '', '', '', '', '']),
      );
    }

    const content: unknown[] = [
      ...this.encabezado('INVENTARIO DE TRANSFERENCIA SECUNDARIA'),
      {
        table: {
          headerRows: 2,
          widths: [20, 35, 61, 68, 119, 35, 35, 42, 42, 27, 29, 68],
          body: filasTabla,
        },
        margin: [0, 0, 0, 24],
      },
      bloqueFirmas(
        [
          {
            etiqueta: 'ENVÍA',
            nombre: nombreUsuario,
            caption: 'Archivo de Concentración',
          },
          {
            etiqueta: 'AUTORIZA',
            caption:
              'Coordinación de Normatividad, Desarrollo Administrativo y de Archivos',
          },
          { etiqueta: 'RECIBE', caption: 'Archivo Histórico' },
        ],
        7,
      ),
      this.pie('Anexo 18/0781 43031-F11-26'),
    ];

    return this.documento(content, [49, 20, 54, 20]);
  }

  // Anexo 13/0779 40031-F09-26 — Calendario de caducidades
  async getCalendarioCaducidadesPdf(rfc: string): Promise<Buffer> {
    const [nombreUsuario, expedientes] = await Promise.all([
      this.getNombreUsuario(rfc),
      this.getExpedientesEnConcentracion(),
    ]);

    // Una fila por serie/subserie (agrupando los expedientes ya recibidos que le pertenecen)
    const porSerie = new Map<
      string,
      {
        codigo: string;
        nombreSerie: string;
        unidadAdministrativa: string;
        dependencia: string;
        anios_consentracion: number | null;
        destino: string | null;
        total: number;
      }
    >();
    for (const e of expedientes) {
      const key = e.codigo || e.nombreSerie;
      if (!porSerie.has(key)) {
        porSerie.set(key, {
          codigo: e.codigo,
          nombreSerie: e.nombreSerie,
          unidadAdministrativa: e.unidadAdministrativa,
          dependencia: e.dependencia,
          anios_consentracion: e.anios_consentracion,
          destino: e.destino,
          total: 0,
        });
      }
      porSerie.get(key)!.total += 1;
    }

    const filasTabla: unknown[][] = [
      [
        this.etiquetaChica('NÚM.'),
        this.etiquetaChica('CÓDIGO DE SERIE'),
        this.etiquetaChica('NOMBRE DE LA SERIE'),
        this.etiquetaChica('DEPENDENCIA'),
        this.etiquetaChica('UNIDAD ADMINISTRATIVA'),
        this.etiquetaChica('NÚM. DE OFICIO'),
        this.etiquetaChica('FECHA DEL OFICIO'),
        this.etiquetaChica('NÚM. DE EXPEDIENTES'),
        this.etiquetaChica('NÚM. DE CAJAS'),
        this.etiquetaChica('TIEMPO DE CONSERVACIÓN'),
        this.etiquetaChica('FECHA DE TÉRMINO DE RESGUARDO'),
        this.etiquetaChica('DESTINO FINAL'),
      ],
    ];
    [...porSerie.values()].forEach((s, i) => {
      filasTabla.push(
        this.filaDatos([
          String(i + 1),
          s.codigo,
          s.nombreSerie,
          s.dependencia,
          s.unidadAdministrativa,
          '',
          '',
          String(s.total),
          '',
          s.anios_consentracion != null ? `${s.anios_consentracion} años` : '',
          '',
          s.destino ?? '',
        ]),
      );
    });
    if (filasTabla.length === 1) {
      filasTabla.push(
        this.filaDatos(['', '', '', '', '', '', '', '', '', '', '', '']),
      );
    }

    const content: unknown[] = [
      ...this.encabezado('CALENDARIO DE CADUCIDADES'),
      {
        table: {
          headerRows: 1,
          widths: [19, 32, 52, 52, 61, 43, 37, 50, 31, 59, 47, 98],
          body: filasTabla,
        },
        margin: [0, 0, 0, 24],
      },
      bloqueFirmas(
        [
          {
            etiqueta: 'ELABORÓ',
            nombre: nombreUsuario,
            caption: 'Persona responsable del Archivo de Concentración',
          },
          {
            etiqueta: 'APROBÓ',
            caption:
              'Persona titular de la Unidad Coordinadora de Gestión Documental y Administración de Archivos',
          },
        ],
        10,
      ),
      this.pie('Anexo 13/0779 40031-F09-26'),
    ];

    return this.documento(content, [49, 20, 54, 20]);
  }
}
