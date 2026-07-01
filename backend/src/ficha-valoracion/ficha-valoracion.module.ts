import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TipoDocModel } from '../models/tipo-doc.model';
import { FichaValoracionController } from './ficha-valoracion.controller';
import { FichaValoracionService } from './ficha-valoracion.service';

@Module({
  imports: [SequelizeModule.forFeature([TipoDocModel])],
  controllers: [FichaValoracionController],
  providers: [FichaValoracionService],
})
export class FichaValoracionModule {}
