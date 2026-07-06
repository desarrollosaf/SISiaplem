import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize, QueryTypes } from 'sequelize';
import { readdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../app.module';

const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const sequelize = app.get<Sequelize>(getConnectionToken());

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS nest_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL
    )
  `);

  const ejecutadas = await sequelize.query<{ name: string }>(
    `SELECT name FROM nest_migrations`,
    { type: QueryTypes.SELECT },
  );
  const ejecutadasSet = new Set(ejecutadas.map((m) => m.name));

  const archivos = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
    .sort();

  if (archivos.length === 0) {
    console.log('No hay migraciones en src/database/migrations.');
  }

  for (const archivo of archivos) {
    if (ejecutadasSet.has(archivo)) {
      console.log(`↷ ${archivo} ya aplicada, se omite.`);
      continue;
    }
    console.log(`🔧 Aplicando ${archivo}...`);
    const modulo = require(join(MIGRATIONS_DIR, archivo));
    if (typeof modulo.up !== 'function') {
      throw new Error(`${archivo} no exporta una función "up(sequelize)".`);
    }
    await modulo.up(sequelize);
    await sequelize.query(
      `INSERT INTO nest_migrations (name, executed_at) VALUES (:name, NOW())`,
      { replacements: { name: archivo } },
    );
    console.log(`✅ ${archivo} aplicada.`);
  }

  await app.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
