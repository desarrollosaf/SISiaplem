import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GuiaController } from './guia.controller';
import { GuiaService } from './guia.service';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { ExpedienteSerieSubseModel } from '../models/expediente-serie-subse.model';
import { RegistroModel } from '../models/registro.model';
import { RegistroDocsModel } from '../models/registro-docs.model';
import { RegistroFisicoModel } from '../models/registro-fisico.model';
import { TipoExpedienteTratamientoModel } from '../models/tipo-expediente-tratamiento.model';
import { SUsuario } from '../models/s-usuario.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ResponsableArchivoModel,
      SerieModel,
      SubSerieModel,
      ExpedienteSerieSubseModel,
      RegistroModel,
      RegistroDocsModel,
      RegistroFisicoModel,
      TipoExpedienteTratamientoModel,
    ]),
    SequelizeModule.forFeature([SUsuario], 'saf'),
  ],
  controllers: [GuiaController],
  providers: [GuiaService],
})
export class GuiaModule {}
