import { Sequelize } from 'sequelize';

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_responsables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo_procedimiento VARCHAR(50) NULL,
      rfc_responsable VARCHAR(13) NOT NULL,
      nombre_responsable VARCHAR(255) NULL,
      activo TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}
