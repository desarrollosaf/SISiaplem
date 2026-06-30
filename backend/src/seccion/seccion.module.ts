import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeccionEntity } from '../subfondo/entities/seccion.entity';
import { SerieEntity } from '../subfondo/entities/serie.entity';
import { SubSerieEntity } from '../subfondo/entities/sub-serie.entity';
import { SubfondoEntity } from '../subfondo/entities/subfondo.entity';
import { TipoSeccionEntity } from '../subfondo/entities/tipo-seccion.entity';
import { SeccionController } from './seccion.controller';
import { SeccionService } from './seccion.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SeccionEntity,
      SerieEntity,
      SubSerieEntity,
      SubfondoEntity,
      TipoSeccionEntity,
    ]),
  ],
  controllers: [SeccionController],
  providers: [SeccionService],
})
export class SeccionModule {}
