import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TipoDocEntity } from './entities/tipo-doc.entity';
import { FichaValoracionController } from './ficha-valoracion.controller';
import { FichaValoracionService } from './ficha-valoracion.service';

@Module({
  imports: [SequelizeModule.forFeature([TipoDocEntity])],
  controllers: [FichaValoracionController],
  providers: [FichaValoracionService],
})
export class FichaValoracionModule {}
