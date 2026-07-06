import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CadidoController } from './cadido.controller';
import { CadidoService } from './cadido.service';
import { ValorDocumentalSerieSubserieModel } from 'src/models/valor_documental_serie_subserie.model';
import { ValorDocumentalsModel } from 'src/models/valor_documentals.model';
import { DestinoFinalModel } from 'src/models/destino_final.model';

@Module({
  imports: [SequelizeModule.forFeature([
    ValorDocumentalSerieSubserieModel,
    ValorDocumentalsModel, 
    DestinoFinalModel
  ])],
  controllers: [CadidoController],
  providers: [CadidoService],
})
export class CadidoModule {}
