import { Sequelize, QueryTypes } from 'sequelize';

export async function up(sequelize: Sequelize) {
  const existentes = await sequelize.query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tickets'`,
    { type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((c) => c.COLUMN_NAME));

  if (!nombresExistentes.has('rfc_titular')) {
    await sequelize.query(`ALTER TABLE tickets ADD COLUMN rfc_titular VARCHAR(13) NULL AFTER rfc_solicitante`);
    console.log('  ✅ rfc_titular agregada a tickets.');
  } else {
    console.log('  ↷ rfc_titular ya existe, se omite.');
  }
}
