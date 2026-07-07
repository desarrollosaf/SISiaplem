import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DestinoFinalModel } from 'src/models/destino_final.model';
import { SeccionModel } from 'src/models/seccion.model';
import { SerieModel } from 'src/models/serie.model';
import { SubSerieModel } from 'src/models/sub-serie.model';
import { SubfondoModel } from 'src/models/subfondo.model';
import { TDependencia } from 'src/models/t-dependencia.model';
import { ValorDocumentalSerieSubserieModel } from 'src/models/valor_documental_serie_subserie.model';
import { ValorDocumentals } from 'src/models/valor_documentals';
import { ValorDocumentalsModel } from 'src/models/valor_documentals.model';

@Injectable()
export class CadidoService {
  constructor(
    @InjectModel(SubfondoModel)
    private readonly subfondoModel: typeof SubfondoModel,
    @InjectModel(TDependencia, 'saf')
    private readonly dependenciaModel: typeof TDependencia,
  ) {}

  async getsubfondos() {
    const subfondos = await this.subfondoModel.findAll({ raw: true });

    const depIds = [
      ...new Set(subfondos.map((s) => s.id_Dependencia).filter(Boolean)),
    ];
    const dependencias = depIds.length
      ? await this.dependenciaModel.findAll({
          where: { id_Dependencia: depIds },
          attributes: ['id_Dependencia', 'nombre_completo'],
          raw: true,
        })
      : [];

    const nombreById = new Map(
      dependencias.map((d) => [d.id_Dependencia, d.nombre_completo]),
    );

    return subfondos
      .filter((s) => nombreById.has(s.id_Dependencia))
      .map((s) => ({
        id: s.id,
        codigo: s.codigo,
        subfondo: s.subfondo,
        nombre_completo: nombreById.get(s.id_Dependencia),
      }));
  }

  async getcadido(id: number) {
    const seccion = await SeccionModel.findAll({
      where: {
        id_subfondo: id,
        status: 1,
      },
      include: [
        {
          model: SerieModel,
          include: [
            {
              model: SubSerieModel,
              where: {
                status: 1,
              },
              include: [
                {
                  model: ValorDocumentalSerieSubserieModel,
                  order: ['id_valor', 'asc'],
                },
                {
                  model: DestinoFinalModel,
                },
              ],
            },
            {
              model: ValorDocumentalSerieSubserieModel,
              order: ['id_valor', 'asc'],
            },
            {
              model: DestinoFinalModel,
            },
          ],
          where: {
            status: 1,
          },
        },
      ],
    });

    seccion.map((d) => ({
      id: d.id,
      codigoS: d.codigo,
      seccion: d.seccion,
      series: (d.series ?? []).map((ser) => ({
        id: ser.id,
        codigo: ser.codigo,
        serie: ser.serie,
        at: ser.anio_tramite == null ? 0 : ser.anio_tramite,
        ac: ser.anios_consentracion ?? 0,
        total: ser.total_anios ?? 0,
        valores: (ser.valores ?? []).map((v) => ({
          id: v.id_valor,
        })),
        destino: ser.destino?.valor ?? null,
        id_destino: ser.id_destino,
        subseries: (ser.subSeries ?? []).map((sub) => ({
          id: sub.id,
          codigo: sub.codigo,
          subserie: sub.subserie,
          at: sub.anio_tramite ?? 0,
          ac: sub.anios_consentracion ?? 0,
          total: sub.total_anios ?? 0,
          valores: (sub.valores ?? []).map((v) => ({
            id: v.id_valor,
          })),
          destino: sub.destino?.valor ?? null,
        })),
      })),
    }));

    return seccion;
  }

  async getserie(id: number, tipo: number) {
    let serie;
    if (tipo == 1) {
      serie = await SerieModel.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ValorDocumentalSerieSubserieModel,
          },
          {
            model: DestinoFinalModel,
          },
        ],
      });
    } else {
      serie = await SubSerieModel.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ValorDocumentalSerieSubserieModel,
          },
          {
            model: DestinoFinalModel,
          },
        ],
      });
    }

    const valores = await ValorDocumentalsModel.findAll();
    const destinos = await DestinoFinalModel.findAll();
    console.log('hola', valores, destinos, serie);
    const response = {
      series: serie,
      valoresS: valores,
      destinosS: destinos,
    };
    return response;
  }

  async update(
    id: number,
    dto: {
      codigo: string;
      serie: string;
      anio_tramite: number;
      anios_consentracion: number;
      total_anios: number;
      id_destino: number;
      valoresSeleccionados: [];
      tipo: number;
    },
  ) {
    const { valoresSeleccionados, ...data } = dto;

    if (dto.tipo == 1) {
      await SerieModel.update(data, { where: { id } });

      if (valoresSeleccionados !== undefined) {
        await ValorDocumentalSerieSubserieModel.destroy({
          where: { id_serie: id },
        });
        if (valoresSeleccionados.length > 0) {
          await ValorDocumentalSerieSubserieModel.bulkCreate(
            valoresSeleccionados.map((id_valor) => ({
              id_serie: id,
              id_valor,
            })),
          );
        }
      }
    } else {
      await SubSerieModel.update(data, { where: { id } });

      if (valoresSeleccionados !== undefined) {
        await ValorDocumentalSerieSubserieModel.destroy({
          where: { id_subserie: id },
        });
        if (valoresSeleccionados.length > 0) {
          await ValorDocumentalSerieSubserieModel.bulkCreate(
            valoresSeleccionados.map((id_valor) => ({
              id_subserie: id,
              id_valor,
            })),
          );
        }
      }
    }

    return { id, ...data };
  }
}
