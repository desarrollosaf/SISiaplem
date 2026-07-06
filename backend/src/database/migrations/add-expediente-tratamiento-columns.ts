import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { AppModule } from '../../app.module';

const TABLE = 'expediente_serie_subses';
const COLUMNS: Record<string, string> = {
  rfc_usuario_expediente: 'VARCHAR(20) NULL',
  id_tipo_expediente: 'BIGINT UNSIGNED NULL',
};

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const sequelize = app.get<Sequelize>(getConnectionToken());

  const existentes = await sequelize.query<{ COLUMN_NAME: string }>(
    `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :table`,
    { replacements: { table: TABLE }, type: QueryTypes.SELECT },
  );
  const nombresExistentes = new Set(existentes.map((c) => c.COLUMN_NAME));

  for (const [columna, definicion] of Object.entries(COLUMNS)) {
    if (nombresExistentes.has(columna)) {
      console.log(`↷ ${columna} ya existe, se omite.`);
      continue;
    }
    console.log(`🔧 Agregando columna ${columna}...`);
    await sequelize.query(`ALTER TABLE ${TABLE} ADD COLUMN ${columna} ${definicion}`);
    console.log(`✅ ${columna} agregada.`);
  }

  await app.close();
}

run().catch(e => { console.error(e); process.exit(1); });
