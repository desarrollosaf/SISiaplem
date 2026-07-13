import { Sequelize, QueryTypes } from 'sequelize';

export async function up(sequelize: Sequelize) {
  const existentes = await sequelize.query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'solicitudes_consulta'`,
    { type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((c) => c.COLUMN_NAME));

  if (!nombresExistentes.has('fecha_limite')) {
    await sequelize.query(`ALTER TABLE solicitudes_consulta ADD COLUMN fecha_limite DATE NULL`);
    console.log('  ✅ fecha_limite agregada a solicitudes_consulta.');
  } else {
    console.log('  ↷ fecha_limite ya existe, se omite.');
  }
}
