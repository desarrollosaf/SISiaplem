import { Sequelize, QueryTypes } from 'sequelize';

// La autorización del Titular dejó de depender de un catálogo manual: ahora
// se resuelve en el backend por jerarquía organizacional (dirección +
// puesto) a partir de s_usuario. Esta tabla ya no se usa ni se alimenta.
export async function up(sequelize: Sequelize) {
  const existentes = await sequelize.query<{ TABLE_NAME: string }>(
    `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ticket_titulares'`,
    { type: QueryTypes.SELECT },
  );

  if (existentes.length) {
    await sequelize.query(`DROP TABLE ticket_titulares`);
    console.log('  ✅ tabla ticket_titulares eliminada.');
  } else {
    console.log('  ↷ ticket_titulares ya no existe, se omite.');
  }
}
