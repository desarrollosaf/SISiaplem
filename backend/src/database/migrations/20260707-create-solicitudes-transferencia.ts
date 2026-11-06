import { Sequelize, QueryTypes } from 'sequelize';

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS solicitudes_transferencia (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      id_departamento INT NOT NULL,
      rfc_solicita VARCHAR(20) NOT NULL,
      rfc_revisa VARCHAR(20) NULL,
      fecha_revision DATETIME NULL,
      autorizada TINYINT(1) NULL,
      motivo_rechazo TEXT NULL,
      rfc_recibe VARCHAR(20) NULL,
      fecha_recepcion DATETIME NULL,
      estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      total_fojas INT NULL,
      total_cajas INT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const existentes = await sequelize.query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'expediente_serie_subses'`,
    { type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((c) => c.COLUMN_NAME));

  if (!nombresExistentes.has('id_solicitud_transferencia')) {
    console.log('  🔧 Agregando columna id_solicitud_transferencia...');
    await sequelize.query(
      `ALTER TABLE expediente_serie_subses ADD COLUMN id_solicitud_transferencia BIGINT UNSIGNED NULL`,
    );
    console.log('  ✅ id_solicitud_transferencia agregada.');
  } else {
    console.log('  ↷ id_solicitud_transferencia ya existe, se omite.');
  }
}
