import * as dotenv from 'dotenv';

import { resolve } from 'path';

import { Sequelize } from 'sequelize-typescript';

import { EstatusModel } from '../../models/estatus.model';

dotenv.config({ path: resolve(__dirname, '../../..', '.env') });

const estatus = [

  { id: 1, status: 'Pendiente' },

  { id: 2, status: 'En revisión' },

  { id: 3, status: 'Aprobada' },

  { id: 4, status: 'Rechazada' },

];

async function run() {

  const sequelize = new Sequelize({

    dialect: 'mysql',

    host: process.env.DB_HOST ?? '127.0.0.1',

    port: Number(process.env.DB_PORT ?? 3306),

    username: process.env.DB_USER,

    password: process.env.DB_PASS,

    database: process.env.DB_NAME,

    logging: false,

    models: [EstatusModel],

  });

  await sequelize.authenticate();

  console.log('🗑️ Limpiando tabla estatuses...');

  await EstatusModel.destroy({ where: {} });

  console.log('📋 Insertando estatuses...');

  for (const item of estatus) {

    await EstatusModel.create({

      id: item.id,

      status: item.status,

    });

  }

  await sequelize.close();

  console.log('✅ Seeder completado');

}

run().catch((e) => {

  console.error(e);

  process.exit(1);

});