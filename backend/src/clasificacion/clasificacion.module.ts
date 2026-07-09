import { Module } from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';
import { ClasificacionController } from './clasificacion.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TipoTramiteModel } from 'src/models/tipo_tramite.model';
import { TipoTramiteMovModel } from 'src/models/tipo_tramite_mov.model';
import { EstatusModel } from 'src/models/estatus.model';
import { SolicitudClasificacionModel } from 'src/models/solicitud_clasificacion.model';

@Module({
  imports: [SequelizeModule.forFeature([
    TipoTramiteModel,
    TipoTramiteMovModel,
    EstatusModel,
    SolicitudClasificacionModel
  ])],
  controllers: [ClasificacionController],
  providers: [ClasificacionService],
})

export class ClasificacionModule {}
