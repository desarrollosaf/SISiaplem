import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';

@Injectable()
export class GuiaService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  // Guia.index() — series del usuario con subseries y conteo de expedientes
  async getInventario(rfc: string) {
    const responsables = await this.sequelize.query<{ id_Departamento: number }>(
      `SELECT id_Departamento FROM responsables_archivos
       WHERE rfc_responsable = :rfc AND status = 1`,
      { replacements: { rfc }, type: QueryTypes.SELECT },
    );

    if (!responsables.length) return [];

    const deptIds = responsables.map((r) => r.id_Departamento);

    const series = await this.sequelize.query<{
      id: number; codigo: string; serie: string; total_expedientes: number;
    }>(
      `SELECT s.id, s.codigo, s.serie,
              COUNT(e.id) AS total_expedientes
       FROM series s
       LEFT JOIN expediente_serie_subses e ON e.id_serie = s.id AND e.status = 1
       WHERE s.departamento_id IN (:deptIds) AND s.status = 1
       GROUP BY s.id, s.codigo, s.serie
       ORDER BY s.codigo`,
      { replacements: { deptIds }, type: QueryTypes.SELECT },
    );

    for (const serie of series) {
      const subseries = await this.sequelize.query<{
        id: number; codigo: string; subserie: string; total_expedientes: number;
      }>(
        `SELECT ss.id, ss.codigo, ss.subserie,
                COUNT(e.id) AS total_expedientes
         FROM sub_series ss
         LEFT JOIN expediente_serie_subses e ON e.id_subserie = ss.id AND e.status = 1
         WHERE ss.idSerie = :serieId AND ss.status = 1
         GROUP BY ss.id, ss.codigo, ss.subserie
         ORDER BY ss.codigo`,
        { replacements: { serieId: serie.id }, type: QueryTypes.SELECT },
      );
      (serie as any).subseries = subseries;
    }

    return series;
  }

  // GuiaController.expedienteSerie() — expedientes de una serie
  async getExpedientesSerie(id: number) {
    return this.sequelize.query(
      `SELECT id, nombre_ex, anio, fecha_cierre_exp, status, created_at
       FROM expediente_serie_subses
       WHERE id_serie = :id AND status = 1
       ORDER BY anio DESC, nombre_ex ASC`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
  }

  // GuiaController.expedienteSerieSub() — expedientes de una subserie
  async getExpedientesSubserie(id: number) {
    return this.sequelize.query(
      `SELECT id, nombre_ex, anio, fecha_cierre_exp, status, created_at
       FROM expediente_serie_subses
       WHERE id_subserie = :id AND status = 1
       ORDER BY anio DESC, nombre_ex ASC`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
  }

  // GuiaController.expActivos()
  async getActivos(rfc: string) {
    const responsables = await this.sequelize.query<{ id_Departamento: number }>(
      `SELECT id_Departamento FROM responsables_archivos
       WHERE rfc_responsable = :rfc AND status = 1`,
      { replacements: { rfc }, type: QueryTypes.SELECT },
    );
    if (!responsables.length) return [];
    const deptIds = responsables.map((r) => r.id_Departamento);

    return this.sequelize.query(
      `SELECT e.id, e.nombre_ex, e.anio, e.fecha_cierre_exp, e.status,
              s.codigo AS serie_codigo, s.serie AS serie_nombre,
              ss.codigo AS subserie_codigo, ss.subserie AS subserie_nombre
       FROM expediente_serie_subses e
       LEFT JOIN series s ON s.id = e.id_serie
       LEFT JOIN sub_series ss ON ss.id = e.id_subserie
       WHERE (
         s.departamento_id IN (:deptIds)
         OR ss.id_Departamento IN (:deptIds)
       )
       AND e.status = 1
       AND e.fecha_cierre_exp IS NULL
       ORDER BY e.created_at DESC`,
      { replacements: { deptIds }, type: QueryTypes.SELECT },
    );
  }

  // GuiaController.expCerrados()
  async getCerrados(rfc: string) {
    const responsables = await this.sequelize.query<{ id_Departamento: number }>(
      `SELECT id_Departamento FROM responsables_archivos
       WHERE rfc_responsable = :rfc AND status = 1`,
      { replacements: { rfc }, type: QueryTypes.SELECT },
    );
    if (!responsables.length) return [];
    const deptIds = responsables.map((r) => r.id_Departamento);

    return this.sequelize.query(
      `SELECT e.id, e.nombre_ex, e.anio, e.fecha_cierre_exp, e.status,
              s.codigo AS serie_codigo, s.serie AS serie_nombre,
              ss.codigo AS subserie_codigo, ss.subserie AS subserie_nombre
       FROM expediente_serie_subses e
       LEFT JOIN series s ON s.id = e.id_serie
       LEFT JOIN sub_series ss ON ss.id = e.id_subserie
       WHERE (
         s.departamento_id IN (:deptIds)
         OR ss.id_Departamento IN (:deptIds)
       )
       AND e.status = 1
       AND e.fecha_cierre_exp IS NOT NULL
       ORDER BY e.fecha_cierre_exp DESC`,
      { replacements: { deptIds }, type: QueryTypes.SELECT },
    );
  }

  // GuiaController.store() — crear expediente
  async crearExpediente(dto: {
    id_serie?: number;
    id_subserie?: number;
    nombre_ex: string;
    anio: string;
  }) {
    const result = await this.sequelize.query(
      `INSERT INTO expediente_serie_subses (id_serie, id_subserie, nombre_ex, anio, status, created_at, updated_at)
       VALUES (:id_serie, :id_subserie, :nombre_ex, :anio, 1, NOW(), NOW())`,
      {
        replacements: {
          id_serie: dto.id_serie ?? null,
          id_subserie: dto.id_subserie ?? null,
          nombre_ex: dto.nombre_ex,
          anio: dto.anio,
        },
        type: QueryTypes.INSERT,
      },
    );
    return { id: result[0], ...dto };
  }

  // GuiaController.cerrarExp()
  async cerrarExpediente(id: number) {
    await this.sequelize.query(
      `UPDATE expediente_serie_subses
       SET fecha_cierre_exp = CURDATE(), updated_at = NOW()
       WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.UPDATE },
    );
    return { ok: true };
  }

  // Obtener datos de una serie (para el encabezado del detalle)
  async getSerie(id: number) {
    const rows = await this.sequelize.query<{
      id: number; codigo: string; serie: string;
    }>(
      `SELECT id, codigo, serie FROM series WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  // Obtener datos de una subserie
  async getSubserie(id: number) {
    const rows = await this.sequelize.query<{
      id: number; codigo: string; subserie: string; idSerie: number;
    }>(
      `SELECT ss.id, ss.codigo, ss.subserie, ss.idSerie,
              s.codigo AS serie_codigo, s.serie AS serie_nombre
       FROM sub_series ss
       JOIN series s ON s.id = ss.idSerie
       WHERE ss.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }
}
