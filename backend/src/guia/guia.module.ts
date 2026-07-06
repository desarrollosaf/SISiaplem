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
import { DocumentosEnvioModel } from '../models/documentos-envio.model';
import { TipoDocModel } from '../models/tipo-doc.model';
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
      DocumentosEnvioModel,
      TipoDocModel,
      TipoExpedienteTratamientoModel,
    ]),
    SequelizeModule.forFeature([SUsuario], 'saf'),
  ],
  controllers: [GuiaController],
  providers: [GuiaService],
})
export class GuiaModule {}
