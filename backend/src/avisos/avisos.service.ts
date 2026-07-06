import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, QueryTypes } from 'sequelize';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export class CreateAvisoDto {
  titulo: string;
  descripcion: string;
  tipo?: 'info' | 'curso' | 'evento' | 'urgente';
}

@Injectable()
export class AvisosService {
  constructor(@InjectConnection() private readonly db: Sequelize) {}

  async findAll() {
    return this.db.query(
      `SELECT id, titulo, descripcion, tipo, pdf_path, activo, created_at, updated_at
       FROM avisos ORDER BY created_at DESC`,
      { type: QueryTypes.SELECT },
    );
  }

  async findRecientes(limit = 5) {
    return this.db.query(
      `SELECT id, titulo, descripcion, tipo, pdf_path, created_at
       FROM avisos WHERE activo = 1 ORDER BY created_at DESC LIMIT :limit`,
      { replacements: { limit }, type: QueryTypes.SELECT },
    );
  }

  async findOne(id: number) {
    const rows = await this.db.query<any>(
      `SELECT * FROM avisos WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    if (!rows.length) throw new NotFoundException('Aviso no encontrado');
    return rows[0];
  }

  async create(dto: CreateAvisoDto, pdfPath?: string) {
    const [result] = await this.db.query(
      `INSERT INTO avisos (titulo, descripcion, tipo, pdf_path, activo)
       VALUES (:titulo, :descripcion, :tipo, :pdf_path, 1)`,
      {
        replacements: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          tipo: dto.tipo ?? 'info',
          pdf_path: pdfPath ?? null,
        },
        type: QueryTypes.INSERT,
      },
    );
    return this.findOne(result as number);
  }

  async update(id: number, dto: Partial<CreateAvisoDto>, pdfPath?: string) {
    const aviso = await this.findOne(id);

    // Si llega nuevo PDF, borra el anterior
    if (pdfPath && aviso.pdf_path) {
      const old = join(process.cwd(), 'uploads', aviso.pdf_path);
      if (existsSync(old)) unlinkSync(old);
    }

    await this.db.query(
      `UPDATE avisos SET
         titulo      = COALESCE(:titulo,      titulo),
         descripcion = COALESCE(:descripcion, descripcion),
         tipo        = COALESCE(:tipo,        tipo),
         pdf_path    = COALESCE(:pdf_path,    pdf_path)
       WHERE id = :id`,
      {
        replacements: {
          titulo: dto.titulo ?? null,
          descripcion: dto.descripcion ?? null,
          tipo: dto.tipo ?? null,
          pdf_path: pdfPath ?? null,
          id,
        },
        type: QueryTypes.UPDATE,
      },
    );
    return this.findOne(id);
  }

  async toggleActivo(id: number) {
    await this.findOne(id);
    await this.db.query(
      `UPDATE avisos SET activo = IF(activo = 1, 0, 1) WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.UPDATE },
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    const aviso = await this.findOne(id);
    if (aviso.pdf_path) {
      const file = join(process.cwd(), 'uploads', aviso.pdf_path);
      if (existsSync(file)) unlinkSync(file);
    }
    await this.db.query(
      `DELETE FROM avisos WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.DELETE },
    );
    return { ok: true };
  }
}
