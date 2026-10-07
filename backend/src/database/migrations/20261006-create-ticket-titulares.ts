import { Sequelize } from 'sequelize';

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ticket_titulares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rfc_rat VARCHAR(13) NOT NULL UNIQUE,
      rfc_titular VARCHAR(13) NOT NULL,
      nombre_titular VARCHAR(255) NULL,
      activo TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}
