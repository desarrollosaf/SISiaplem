import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SeccionDirModel } from '../models/seccion-dir.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';
import { TipoSeccionModel } from '../models/tipo-seccion.model';

@Injectable()
export class SeccionService {
  constructor(
    @InjectModel(SeccionModel)
    private readonly seccionModel: typeof SeccionModel,
    @InjectModel(SerieModel)
    private readonly serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel)
    private readonly subSerieModel: typeof SubSerieModel,
    @InjectModel(SubfondoModel)
    private readonly subfondoModel: typeof SubfondoModel,
    @InjectModel(TipoSeccionModel)
    private readonly tipoSeccionModel: typeof TipoSeccionModel,
    @InjectModel(SeccionDirModel)
    private readonly seccionDirModel: typeof SeccionDirModel,
    @InjectModel(TDepartamento, 'saf')
    private readonly departamentoModel: typeof TDepartamento,
    @InjectModel(TDireccion, 'saf')
    private readonly direccionModel: typeof TDireccion,
  ) {}

  // ── Catálogos ─────────────────────────────────────────────────────────────

  async getTipoSecciones() {
    return this.tipoSeccionModel.findAll({ order: [['id', 'ASC']] });
  }

  async getDirecciones(subfondoId: number) {
    const subfondo = await this.subfondoModel.findByPk(subfondoId);
    if (!subfondo) return [];

    const depe = subfondo.id_Dependencia;

    if (depe === 3) {
      const dirs = await this.direccionModel.findAll({
        where: { id_Dependencia: 3, Estado: 1 },
        order: [['nombre_completo', 'ASC']],
      });
      return dirs.map((d) => ({
        id: d.id_Direccion,
        label: d.nombre_completo,
      }));
    }

    const deptos = await this.departamentoModel.findAll({
      where: { id_Dependencia: depe },
      order: [['nombre_completo', 'ASC']],
    });

    // Filtra departamentos cuyo c_presup termina en '01' (igual que el WHERE LIKE '%01' de Laravel)
    const filtrados = deptos.filter((d) =>
      String(d.c_presup ?? '').endsWith('01'),
    );

    return filtrados.map((d) => ({
      id: d.id_Direccion,
      label: d.nombre_completo,
    }));
  }

  // ── Secciones ─────────────────────────────────────────────────────────────

  async getBySub(subfondoId: number) {
    const subfondo = await this.subfondoModel.findByPk(subfondoId);
    const secciones = await this.seccionModel.findAll({
      where: { id_subfondo: subfondoId },
      order: [['codigo', 'ASC']],
    });
    // Añadir ids de direcciones por sección
    const ids = secciones.map((s) => s.id);
    const dirs =
      ids.length > 0
        ? await this.seccionDirModel.findAll({ where: { id_seccion: ids } })
        : [];

    const seccionesConDirs = secciones.map((s) => ({
      ...s.toJSON(),
      direccion_ids: dirs
        .filter((d) => d.id_seccion === s.id)
        .map((d) => d.id_Departamento),
    }));

    return { subfondo, secciones: seccionesConDirs };
  }

  async findOne(id: number) {
    const seccion = await this.seccionModel.findByPk(id, {
      include: [
        {
          model: SerieModel,
          required: false,
          include: [{ model: SubSerieModel, required: false }],
        },
      ],
    });
    if (!seccion) return null;
    const dirs = await this.seccionDirModel.findAll({ where: { id_seccion: id } });
    return {
      ...seccion.toJSON(),
      direccion_ids: dirs.map((d) => d.id_Departamento),
    };
  }

  async create(dto: {
    id_subfondo: number;
    codigo: string;
    seccion: string;
    id_tipo_seccion: number;
    direccion_ids?: number[];
  }) {
    const { direccion_ids, ...data } = dto;
    const sec = await this.seccionModel.create({ ...data, status: 1 });

    if (direccion_ids && direccion_ids.length > 0) {
      await this.seccionDirModel.bulkCreate(
        direccion_ids.map((id_Departamento) => ({
          id_seccion: sec.id,
          id_Departamento,
        })),
      );
    }

    return sec;
  }

  async update(
    id: number,
    dto: {
      codigo: string;
      seccion: string;
      id_tipo_seccion: number;
      direccion_ids?: number[];
    },
  ) {
    const { direccion_ids, ...data } = dto;
    await this.seccionModel.update(data, { where: { id } });

    if (direccion_ids !== undefined) {
      await this.seccionDirModel.destroy({ where: { id_seccion: id } });
      if (direccion_ids.length > 0) {
        await this.seccionDirModel.bulkCreate(
          direccion_ids.map((id_Departamento) => ({
            id_seccion: id,
            id_Departamento,
          })),
        );
      }
    }

    return { id, ...data };
  }

  async toggleStatus(id: number) {
    const sec = await this.seccionModel.findByPk(id);
    if (!sec) return null;
    const status = sec.status === 1 ? 0 : 1;

    const series = await this.serieModel.findAll({ where: { idSeccion: id } });
    for (const ser of series) {
      await this.subSerieModel.update(
        { status },
        { where: { idSerie: ser.id } },
      );
    }
    await this.serieModel.update({ status }, { where: { idSeccion: id } });
    await this.seccionModel.update({ status }, { where: { id } });

    return { id, status };
  }

  async remove(id: number) {
    const series = await this.serieModel.findAll({ where: { idSeccion: id } });
    for (const ser of series) {
      await this.subSerieModel.destroy({ where: { idSerie: ser.id } });
    }
    await this.serieModel.destroy({ where: { idSeccion: id } });
    await this.seccionDirModel.destroy({ where: { id_seccion: id } });
    await this.seccionModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Series ────────────────────────────────────────────────────────────────

  async createSerie(dto: {
    idSeccion: number;
    codigo: string;
    serie: string;
    departamento_id?: number | null;
  }) {
    return this.serieModel.create({ ...dto, status: 1 });
  }

  async updateSerie(
    id: number,
    dto: { codigo: string; serie: string; departamento_id?: number | null },
  ) {
    await this.serieModel.update(dto, { where: { id } });
    return { id, ...dto };
  }

  async toggleSerie(id: number) {
    const ser = await this.serieModel.findByPk(id);
    if (!ser) return null;
    const status = ser.status === 1 ? 0 : 1;
    await this.subSerieModel.update({ status }, { where: { idSerie: id } });
    await this.serieModel.update({ status }, { where: { id } });
    return { id, status };
  }

  async removeSerie(id: number) {
    await this.subSerieModel.destroy({ where: { idSerie: id } });
    await this.serieModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Subseries ─────────────────────────────────────────────────────────────

  async createSubserie(dto: {
    idSerie: number;
    codigo: string;
    subserie: string;
    id_Departamento?: number | null;
  }) {
    return this.subSerieModel.create({ ...dto, status: 1 });
  }

  async updateSubserie(
    id: number,
    dto: { codigo: string; subserie: string; id_Departamento?: number | null },
  ) {
    await this.subSerieModel.update(dto, { where: { id } });
    return { id, ...dto };
  }

  async toggleSubserie(id: number) {
    const sub = await this.subSerieModel.findByPk(id);
    if (!sub) return null;
    const status = sub.status === 1 ? 0 : 1;
    await this.subSerieModel.update({ status }, { where: { id } });
    return { id, status };
  }

  async removeSubserie(id: number) {
    await this.subSerieModel.destroy({ where: { id } });
    return { ok: true };
  }
}
