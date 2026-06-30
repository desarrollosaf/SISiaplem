import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SeccionEntity } from '../subfondo/entities/seccion.entity';
import { SerieEntity } from '../subfondo/entities/serie.entity';
import { SubSerieEntity } from '../subfondo/entities/sub-serie.entity';
import { SubfondoEntity } from '../subfondo/entities/subfondo.entity';
import { TipoSeccionEntity } from '../subfondo/entities/tipo-seccion.entity';

@Injectable()
export class SeccionService {
  constructor(
    @InjectModel(SeccionEntity)
    private readonly seccionModel: typeof SeccionEntity,
    @InjectModel(SerieEntity)
    private readonly serieModel: typeof SerieEntity,
    @InjectModel(SubSerieEntity)
    private readonly subSerieModel: typeof SubSerieEntity,
    @InjectModel(SubfondoEntity)
    private readonly subfondoModel: typeof SubfondoEntity,
    @InjectModel(TipoSeccionEntity)
    private readonly tipoSeccionModel: typeof TipoSeccionEntity,
  ) {}

  // ── Catálogo ──────────────────────────────────────────────────────────────

  async getTipoSecciones() {
    return this.tipoSeccionModel.findAll({ order: [['id', 'ASC']] });
  }

  // ── Secciones ─────────────────────────────────────────────────────────────

  async getBySub(subfondoId: number) {
    const subfondo = await this.subfondoModel.findByPk(subfondoId);
    const secciones = await this.seccionModel.findAll({
      where: { id_subfondo: subfondoId },
      order: [['codigo', 'ASC']],
    });
    return { subfondo, secciones };
  }

  async findOne(id: number) {
    return this.seccionModel.findByPk(id, {
      include: [
        {
          model: SerieEntity,
          required: false,
          include: [{ model: SubSerieEntity, required: false }],
        },
      ],
    });
  }

  async create(dto: {
    id_subfondo: number;
    codigo: string;
    seccion: string;
    id_tipo_seccion: number;
  }) {
    return this.seccionModel.create({ ...dto, status: 1 });
  }

  async update(
    id: number,
    dto: { codigo: string; seccion: string; id_tipo_seccion: number },
  ) {
    await this.seccionModel.update(dto, { where: { id } });
    return { id, ...dto };
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
    await this.seccionModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Series ────────────────────────────────────────────────────────────────

  async createSerie(dto: { idSeccion: number; codigo: string; serie: string }) {
    return this.serieModel.create({ ...dto, status: 1 });
  }

  async updateSerie(id: number, dto: { codigo: string; serie: string }) {
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
  }) {
    return this.subSerieModel.create({ ...dto, status: 1 });
  }

  async updateSubserie(id: number, dto: { codigo: string; subserie: string }) {
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
