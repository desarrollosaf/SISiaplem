import { Sequelize, QueryTypes } from 'sequelize';

const PERMISOS = ['transferencias.revisar', 'transferencias.recibir'];

export async function up(sequelize: Sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_permission_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS model_has_permissions (
      permission_id BIGINT UNSIGNED NOT NULL,
      model_type VARCHAR(255) NOT NULL,
      model_id BIGINT UNSIGNED NOT NULL,
      PRIMARY KEY (permission_id, model_type, model_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const existentes = await sequelize.query<{ name: string }>(
    `SELECT name FROM permissions`,
    { type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((p) => p.name));

  for (const nombre of PERMISOS) {
    if (nombresExistentes.has(nombre)) {
      console.log(`  ↷ permiso '${nombre}' ya existe, se omite.`);
      continue;
    }
    await sequelize.query(
      `INSERT INTO permissions (name, guard_name, created_at, updated_at) VALUES (:name, 'web', NOW(), NOW())`,
      { replacements: { name: nombre } },
    );
    console.log(`  ✅ permiso '${nombre}' creado.`);
  }
}
