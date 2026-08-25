import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config({ path: resolve(__dirname, '../../..', '.env') });

const MODEL_TYPE = 'App\\Models\\UsersSaf';

const ROLES = [
  { name: 'RAT',   guard_name: 'web', desc: 'Responsable de Archivo de Trámite' },
  { name: 'RAC',   guard_name: 'web', desc: 'Responsable de Archivo de Concentración' },
  { name: 'RAH',   guard_name: 'web', desc: 'Responsable de Archivo Histórico' },
  { name: 'ADMIM', guard_name: 'web', desc: 'Administrador SEAPLEM (acceso total)' },
];

const ASSIGNMENTS: { rfc: string; role: string }[] = [
  { rfc: 'SAGM990220', role: 'ADMIM' },
  { rfc: 'GOVW780501', role: 'ADMIM' },
  { rfc: 'AAGE740529', role: 'RAT'   },
  { rfc: 'VIPL950827', role: 'RAC'   },
  { rfc: 'LUDL690726', role: 'RAH'   },
];

async function run() {
  const main = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
  });

  const saf = new Sequelize({
    dialect: 'mysql',
    host: process.env.SAF_HOST ?? 'host.docker.internal',
    port: Number(process.env.SAF_PORT ?? 3306),
    username: process.env.SAF_USER ?? 'root',
    password: process.env.SAF_PASS ?? '',
    database: process.env.SAF_DB ?? 'adminplem_saf',
    logging: false,
  });

  const Role = main.define('Role', {
    id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name:       { type: DataTypes.STRING(255), allowNull: false },
    guard_name: { type: DataTypes.STRING(255), allowNull: false },
  }, { tableName: 'roles', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

  const ModelHasRole = main.define('ModelHasRole', {
    role_id:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
    model_type: { type: DataTypes.STRING(255),     allowNull: false, primaryKey: true },
    model_id:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, primaryKey: true },
  }, { tableName: 'model_has_roles', timestamps: false });

  const UsersSaf = saf.define('UsersSaf', {
    id:  { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    rfc: { type: DataTypes.STRING, allowNull: true },
  }, { tableName: 'users_safs', timestamps: true, underscored: true, paranoid: true });

  await main.authenticate();
  await saf.authenticate();

  // ── 1. Limpiar asignaciones existentes ────────────────────────────────
  console.log('\n🗑️  Limpiando asignaciones previas...');
  await ModelHasRole.destroy({ where: { model_type: MODEL_TYPE }, truncate: false });
  console.log('  ✅ model_has_roles limpiado');

  // ── 2. Limpiar roles previos ──────────────────────────────────────────
  console.log('\n🗑️  Eliminando roles previos...');
  await Role.destroy({ where: {}, truncate: false });
  console.log('  ✅ roles eliminados');

  // ── 3. Crear roles ────────────────────────────────────────────────────
  console.log('\n📋 Creando roles:');
  const roleMap: Record<string, number> = {};

  for (const r of ROLES) {
    const role = await Role.create({ name: r.name, guard_name: r.guard_name });
    const roleId = (role as unknown as { id: number }).id;
    roleMap[r.name] = roleId;
    console.log(`  ✅ ${r.name} (id: ${roleId}) — ${r.desc}`);
  }

  // ── 4. Asignar roles a usuarios ───────────────────────────────────────
  console.log('\n👥 Asignando roles:');

  for (const a of ASSIGNMENTS) {
    const user = await UsersSaf.findOne({ where: { rfc: a.rfc } }) as { id: number } | null;
    if (!user) {
      console.log(`  ❌ RFC ${a.rfc} no encontrado en users_safs`);
      continue;
    }
    const roleId = roleMap[a.role];
    await ModelHasRole.create({ role_id: roleId, model_type: MODEL_TYPE, model_id: user.id });
    console.log(`  ✅ ${a.rfc} (user_id: ${user.id}) → ${a.role}`);
  }

  await main.close();
  await saf.close();
  console.log('\n✅ Seed completado.\n');
}

run().catch(e => { console.error(e); process.exit(1); });
