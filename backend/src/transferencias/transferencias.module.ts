import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SeccionModel } from '../models/seccion.model';
import { SubfondoModel } from '../models/subfondo.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SolicitudTransferenciaModel } from '../models/solicitud-transferencia.model';
import { SUsuario } from '../models/s-usuario.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ResponsableArchivoModel,
      SerieModel,
      SubSerieModel,
      SeccionModel,
      SubfondoModel,
      ExpedienteSerieSubseModel,
      SolicitudTransferenciaModel,
    ]),
    SequelizeModule.forFeature([SUsuario], 'saf'),
  ],
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
})
export class TransferenciasModule {}
