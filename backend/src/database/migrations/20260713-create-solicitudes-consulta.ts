import { Sequelize } from 'sequelize';

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS solicitudes_consulta (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      id_departamento INT NOT NULL,
      rfc_solicita VARCHAR(20) NOT NULL,
      rfc_revisa VARCHAR(20) NULL,
      fecha_revision DATETIME NULL,
      autorizada TINYINT(1) NULL,
      motivo_rechazo TEXT NULL,
      estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS solicitud_consulta_expedientes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      id_solicitud_consulta BIGINT UNSIGNED NOT NULL,
      id_expediente BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY idx_solicitud_consulta (id_solicitud_consulta),
      KEY idx_expediente (id_expediente)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}
