import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TDependencia } from '../models/t-dependencia.model';
import { SeccionEntity } from './entities/seccion.entity';
import { SerieEntity } from './entities/serie.entity';
import { SubSerieEntity } from './entities/sub-serie.entity';
import { SubfondoEntity } from './entities/subfondo.entity';
import { SubfondoController } from './subfondo.controller';
import { SubfondoService } from './subfondo.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SubfondoEntity,
      SeccionEntity,
      SerieEntity,
      SubSerieEntity,
    ]),
    SequelizeModule.forFeature([TDependencia], 'saf'),
  ],
  controllers: [SubfondoController],
  providers: [SubfondoService],
})
export class SubfondoModule {}
