import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConcentracionController } from './concentracion.controller';
import { ConcentracionService } from './concentracion.service';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { DestinoFinalModel } from '../models/destino_final.model';
import { SUsuario } from '../models/s-usuario.model';
import { TDepartamento } from '../models/t-departamento.model';
import { TDependencia } from '../models/t-dependencia.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ExpedienteSerieSubseModel,
      SerieModel,
      SubSerieModel,
      DestinoFinalModel,
    ]),
    SequelizeModule.forFeature([SUsuario, TDepartamento, TDependencia], 'saf'),
  ],
  controllers: [ConcentracionController],
  providers: [ConcentracionService],
})
export class ConcentracionModule {}
