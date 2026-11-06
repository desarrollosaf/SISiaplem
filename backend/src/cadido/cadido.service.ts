import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DestinoFinalModel } from 'src/models/destino_final.model';
import { SeccionModel } from 'src/models/seccion.model';
import { SerieModel } from 'src/models/serie.model';
import { SubSerieModel } from 'src/models/sub-serie.model';
import { SubfondoModel } from 'src/models/subfondo.model';
import { TDependencia } from 'src/models/t-dependencia.model';
import { ValorDocumentalSerieSubserieModel } from 'src/models/valor_documental_serie_subserie.model';
import { ValorDocumentalsModel } from 'src/models/valor_documentals.model';
import { TecnicaSeleccionModel } from 'src/models/tecnica-seleccion.model';
import { BitacoraClasificacionModel } from 'src/models/bitacora-clasificacion.model';
import { SubsubSerieModel } from 'src/models/subsub-serie.model';

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
          required: false,
          include: [
            {
              model: SubSerieModel,
              where: {
                status: 1,
              },
              required: false,
              include: [
                {
                  model: ValorDocumentalSerieSubserieModel,
                  order: ['id_valor', 'asc'],
                },
                {
                  model: DestinoFinalModel,
                },
                {
                  model: TecnicaSeleccionModel,
                },
                {
                  model: SubsubSerieModel,
                  where: {
                    status: 1,
                  },
                  required: false,
                  include: [
                    {
                      model: DestinoFinalModel,
                    },
                    {
                      model: TecnicaSeleccionModel,
                    },
                  ],
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
            {
              model: TecnicaSeleccionModel,
            },
          ],
          where: {
            status: 1,
          },
        },
      ],
    });

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
          {
            model: TecnicaSeleccionModel,
          },
        ],
      });
    } else if (tipo == 2) {
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
          {
            model: TecnicaSeleccionModel,
          },
        ],
      });
    } else {
      serie = await SubsubSerieModel.findOne({
        where: {
          id,
        },
        include: [
          {
            model: DestinoFinalModel,
          },
          {
            model: TecnicaSeleccionModel,
          },
        ],
      });
    }

    const valores = await ValorDocumentalsModel.findAll();
    const destinos = await DestinoFinalModel.findAll();
    const tecnicas = await TecnicaSeleccionModel.findAll();
    const response = {
      series: serie,
      valoresS: valores,
      destinosS: destinos,
      tecnicasS: tecnicas,
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
      id_tecnica: number | null;
      valoresSeleccionados: number[];
      tipo: number;
      rfc: string;
    },
  ) {
    const { valoresSeleccionados, tipo, rfc, ...data } = dto;

    let idSeccion: number | null = null;

    if (tipo == 1) {
      await SerieModel.update(data, { where: { id } });
      idSeccion = (
        await SerieModel.findByPk(id, { attributes: ['idSeccion'] })
      )?.idSeccion ?? null;

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
    } else if (tipo == 2) {
      await SubSerieModel.update(data, { where: { id } });

      const subserie = await SubSerieModel.findByPk(id, {
        attributes: ['idSerie'],
      });
      if (subserie) {
        idSeccion = (
          await SerieModel.findByPk(subserie.idSerie, {
            attributes: ['idSeccion'],
          })
        )?.idSeccion ?? null;
      }

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
    } else {
      // tipo == 3 (subsubserie): sin tabla de valores primarios propia.
      await SubsubSerieModel.update(data, { where: { id } });

      const subsubserie = await SubsubSerieModel.findByPk(id, {
        attributes: ['idSubserie'],
      });
      if (subsubserie?.idSubserie) {
        const subserie = await SubSerieModel.findByPk(subsubserie.idSubserie, {
          attributes: ['idSerie'],
        });
        if (subserie) {
          idSeccion = (
            await SerieModel.findByPk(subserie.idSerie, {
              attributes: ['idSeccion'],
            })
          )?.idSeccion ?? null;
        }
      }
    }

    await BitacoraClasificacionModel.create({
      movimiento: 'Actualización',
      fecha_movimiento: new Date().toISOString().slice(0, 10),
      usuario_movimiento: rfc,
      id_destino: data.id_destino,
      id_tecnica: data.id_tecnica,
      anios_tramite: data.anio_tramite,
      anios_consentracion: data.anios_consentracion,
      total_anios: data.total_anios,
      id_serie: tipo == 1 ? id : null,
      id_subserie: tipo == 2 ? id : null,
      id_subsubserie: tipo == 3 ? id : null,
      id_seccion: idSeccion,
    });

    return { id, ...data };
  }

  async getBitacora(tipo: number, id: number) {
    const where =
      tipo == 1
        ? { id_serie: id }
        : tipo == 2
          ? { id_subserie: id }
          : { id_subsubserie: id };
    return BitacoraClasificacionModel.findAll({
      where,
      order: [
        ['fecha_movimiento', 'DESC'],
        ['id', 'DESC'],
      ],
    });
  }
}
