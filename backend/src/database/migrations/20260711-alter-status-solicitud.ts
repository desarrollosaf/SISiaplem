import { Sequelize, QueryTypes } from 'sequelize';

const TABLE = 'solicitud_clasificacions';
const COLUMNS: Record<string, string> = {
  status_solicitud: 'BIGINT UNSIGNED NULL DEFAULT 1'
};

export async function up(sequelize: Sequelize) {
  const existentes = await sequelize.query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :table`,
    { replacements: { table: TABLE }, type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((c) => c.COLUMN_NAME));

  for (const [columna, definicion] of Object.entries(COLUMNS)) {
    if (nombresExistentes.has(columna)) {
       await sequelize.query(`ALTER TABLE ${TABLE} DROP COLUMN ${columna}`);
      console.log(`↷ ${columna} ya existe, se elimina.`);
      }
    console.log(`  🔧 Agregando columna ${columna}...`);
    await sequelize.query(`ALTER TABLE ${TABLE} ADD COLUMN ${columna} ${definicion}`);
    console.log(`  ✅ ${columna} agregada.`);
  }
}
