import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TipoDocModel } from '../models/tipo-doc.model';

@Injectable()
export class FichaValoracionService {
  constructor(
    @InjectModel(TipoDocModel)
    private readonly tipoDocModel: typeof TipoDocModel,
  ) {}

  async getAll() {
    return this.tipoDocModel.findAll({ order: [['tipo_doc', 'ASC']] });
  }

  async create(dto: { tipo_doc: string }) {
    return this.tipoDocModel.create({ ...dto, status: 1 });
  }

  async update(id: number, dto: { tipo_doc: string }) {
    await this.tipoDocModel.update(dto, { where: { id } });
    return { id, ...dto };
  }

  async toggleStatus(id: number) {
    const doc = await this.tipoDocModel.findByPk(id);
    if (!doc) return null;
    const status = doc.status === 1 ? 0 : 1;
    await this.tipoDocModel.update({ status }, { where: { id } });
    return { id, status };
  }
}
