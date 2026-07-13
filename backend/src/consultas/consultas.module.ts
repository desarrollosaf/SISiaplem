import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SeccionModel } from '../models/seccion.model';
import { SubfondoModel } from '../models/subfondo.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { SolicitudConsultaModel } from '../models/solicitud-consulta.model';
import { SolicitudConsultaExpedienteModel } from '../models/solicitud-consulta-expediente.model';
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
      SolicitudConsultaModel,
      SolicitudConsultaExpedienteModel,
    ]),
    SequelizeModule.forFeature([SUsuario], 'saf'),
  ],
  controllers: [ConsultasController],
  providers: [ConsultasService],
})
export class ConsultasModule {}
