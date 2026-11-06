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
import { TDepartamento } from '../models/t-departamento.model';
import { TDependencia } from '../models/t-dependencia.model';
import { ValorDocumentalSerieSubserieModel } from '../models/valor_documental_serie_subserie.model';
import { ValorDocumentalsModel } from '../models/valor_documentals.model';

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
      ValorDocumentalSerieSubserieModel,
      ValorDocumentalsModel,
    ]),
    SequelizeModule.forFeature([SUsuario, TDepartamento, TDependencia], 'saf'),
  ],
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
})
export class TransferenciasModule {}
