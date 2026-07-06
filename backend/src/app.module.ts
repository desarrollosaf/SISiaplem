import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GuiaModule } from './guia/guia.module';
import { SubfondoModule } from './subfondo/subfondo.module';
import { FichaValoracionModule } from './ficha-valoracion/ficha-valoracion.module';
import { SeccionModule } from './seccion/seccion.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { SUsuario } from './models/s-usuario.model';
import { UsersSafs } from './models/users-safs.model';
import { TDepartamento } from './models/t-departamento.model';
import { TDependencia } from './models/t-dependencia.model';
import { TDireccion } from './models/t-direccion.model';
import { CadidoModule } from './cadido/cadido.module';
import { AvisosModule } from './avisos/avisos.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: false,
        logging: false,
      }),
    }),
    SequelizeModule.forRoot({
      name: 'saf',
      dialect: 'mysql',
      host: 'host.docker.internal',
      port: 3306,
      username: 'root',
      password: '',
      database: 'adminplem_saf',
      models: [UsersSafs, SUsuario, TDepartamento, TDependencia, TDireccion],
      synchronize: false,
      logging: false,
      dialectOptions: { charset: 'utf8mb4' },
    }),
    AuthModule,
    GuiaModule,
    SubfondoModule,
    FichaValoracionModule,
    SeccionModule,
    ResponsablesModule,
    CadidoModule,
    AvisosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
