import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Sequelize, QueryTypes } from 'sequelize';
import { readdirSync, readFileSync } from 'fs';

dotenv.config({ path: resolve(__dirname, '../../..', '.env') });

const MIGRATIONS_DIR = resolve(__dirname, 'migrations');

async function run() {
  const db = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
  });

  await db.authenticate();

  // ── 1. Crear tabla de control si no existe ────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`_migrations\` (
      \`id\`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`nombre\`     VARCHAR(255) NOT NULL UNIQUE,
      \`ejecutada_en\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // ── 2. Leer migraciones ya ejecutadas ─────────────────────────────────
  const ejecutadas = await db.query<{ nombre: string }>(
    `SELECT nombre FROM \`_migrations\``,
    { type: QueryTypes.SELECT },
  );
  const yaEjecutadas = new Set(ejecutadas.map(r => r.nombre));

  // ── 3. Obtener archivos .sql ordenados ────────────────────────────────
  const archivos = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (archivos.length === 0) {
    console.log('\n⚠️  No hay archivos .sql en migrations/\n');
    await db.close();
    return;
  }

  let nuevas = 0;
  console.log(`\n🗄️  Migraciones (${archivos.length} archivo(s) encontrado(s)):\n`);

  // ── 4. Ejecutar las pendientes ────────────────────────────────────────
  for (const archivo of archivos) {
    if (yaEjecutadas.has(archivo)) {
      console.log(`  ⏭️  ${archivo} — ya ejecutada`);
      continue;
    }

    const sql = readFileSync(resolve(MIGRATIONS_DIR, archivo), 'utf8');

    // Separar múltiples sentencias por punto y coma
    const sentencias = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    try {
      for (const sentencia of sentencias) {
        await db.query(sentencia);
      }
      await db.query(
        `INSERT INTO \`_migrations\` (nombre) VALUES (:nombre)`,
        { replacements: { nombre: archivo }, type: QueryTypes.INSERT },
      );
      console.log(`  ✅ ${archivo} — ejecutada correctamente`);
      nuevas++;
    } catch (err: any) {
      console.error(`  ❌ ${archivo} — ERROR: ${err.message}`);
      await db.close();
      process.exit(1);
    }
  }

  if (nuevas === 0) {
    console.log('\n✅ Todo al día, no hay migraciones pendientes.\n');
  } else {
    console.log(`\n✅ ${nuevas} migración(es) ejecutada(s) correctamente.\n`);
  }

  await db.close();
}

run().catch(e => { console.error(e); process.exit(1); });
