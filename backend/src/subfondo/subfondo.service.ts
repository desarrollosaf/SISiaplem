import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TDependencia } from '../models/t-dependencia.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';

@Injectable()
export class SubfondoService {
  constructor(
    @InjectModel(SubfondoModel)
    private readonly subfondoModel: typeof SubfondoModel,
    @InjectModel(TDependencia, 'saf')
    private readonly dependenciaModel: typeof TDependencia,
  ) {}

  async getAll() {
    const subfondos = await this.subfondoModel.findAll({
      include: [
        {
          model: SeccionModel,
          where: { status: 1 },
          required: false,
          include: [
            {
              model: SerieModel,
              where: { status: 1 },
              required: false,
              include: [
                {
                  model: SubSerieModel,
                  where: { status: 1 },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    const depIds = [
      ...new Set(subfondos.map((s) => s.id_Dependencia).filter(Boolean)),
    ];

    const deps = depIds.length
      ? await this.dependenciaModel.findAll({
          where: { id_Dependencia: depIds },
          attributes: ['id_Dependencia', 'nombre_completo'],
        })
      : [];

    const depMap = new Map(
      deps.map((d) => [d.id_Dependencia, d.nombre_completo]),
    );

    return subfondos.map((sf) => {
      const secciones = sf.secciones ?? [];
      const series = secciones.flatMap((sec) => sec.series ?? []);
      const subseries = series.flatMap((ser) => ser.subSeries ?? []);
      return {
        id: sf.id,
        codigo: sf.codigo,
        subfondo: sf.subfondo,
        id_Dependencia: sf.id_Dependencia,
        nombre_dependencia: depMap.get(sf.id_Dependencia) ?? 'Sin dependencia',
        total_secciones: secciones.length,
        total_series: series.length,
        total_subseries: subseries.length,
      };
    });
  }

  async getDependencias() {
    return this.dependenciaModel.findAll({
      attributes: ['id_Dependencia', 'nombre_completo'],
      order: [['nombre_completo', 'ASC']],
    });
  }

  async create(dto: {
    codigo: string;
    subfondo: string;
    id_Dependencia: number;
  }) {
    return this.subfondoModel.create(dto);
  }

  async update(
    id: number,
    dto: { codigo: string; subfondo: string; id_Dependencia: number },
  ) {
    await this.subfondoModel.update(dto, { where: { id } });
    return { id, ...dto };
  }

  async findOne(id: number) {
    const sf = await this.subfondoModel.findByPk(id, {
      include: [
        {
          model: SeccionModel,
          where: { status: 1 },
          required: false,
          include: [
            {
              model: SerieModel,
              where: { status: 1 },
              required: false,
              include: [
                {
                  model: SubSerieModel,
                  where: { status: 1 },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    if (!sf) return null;

    const dep = sf.id_Dependencia
      ? await this.dependenciaModel.findOne({
          where: { id_Dependencia: sf.id_Dependencia },
          attributes: ['id_Dependencia', 'nombre_completo'],
        })
      : null;

    const secciones = (sf.secciones ?? []).map((sec) => ({
      id: sec.id,
      codigo: sec.codigo,
      seccion: sec.seccion,
      series: (sec.series ?? []).map((ser) => ({
        id: ser.id,
        codigo: ser.codigo,
        serie: ser.serie,
        subseries: (ser.subSeries ?? []).map((sub) => ({
          id: sub.id,
          codigo: sub.codigo,
          subserie: sub.subserie,
        })),
      })),
    }));

    return {
      id: sf.id,
      codigo: sf.codigo,
      subfondo: sf.subfondo,
      id_Dependencia: sf.id_Dependencia,
      nombre_dependencia: dep?.nombre_completo ?? 'Sin dependencia',
      secciones,
    };
  }

  async remove(id: number) {
    await this.subfondoModel.destroy({ where: { id } });
    return { ok: true };
  }
}
