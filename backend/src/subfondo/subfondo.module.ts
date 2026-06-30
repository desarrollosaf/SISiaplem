import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TDependencia } from '../models/t-dependencia.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';
import { SubfondoController } from './subfondo.controller';
import { SubfondoService } from './subfondo.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SubfondoModel,
      SeccionModel,
      SerieModel,
      SubSerieModel,
    ]),
    SequelizeModule.forFeature([TDependencia], 'saf'),
  ],
  controllers: [SubfondoController],
  providers: [SubfondoService],
})
export class SubfondoModule {}
