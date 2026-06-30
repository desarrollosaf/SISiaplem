import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SeccionDirModel } from '../models/seccion-dir.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';
import { TipoSeccionModel } from '../models/tipo-seccion.model';
import { SeccionController } from './seccion.controller';
import { SeccionService } from './seccion.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SeccionModel,
      SerieModel,
      SubSerieModel,
      SubfondoModel,
      TipoSeccionModel,
      SeccionDirModel,
    ]),
    SequelizeModule.forFeature([TDepartamento, TDireccion], 'saf'),
  ],
  controllers: [SeccionController],
  providers: [SeccionService],
})
export class SeccionModule {}
