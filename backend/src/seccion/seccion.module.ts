import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SeccionDirModel } from '../models/seccion-dir.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';
import { SubsubSerieModel } from '../models/subsub-serie.model';
import { TipoDocModel } from '../models/tipo-doc.model';
import { TipoDocSerieModel } from '../models/tipo-doc-serie.model';
import { TipoSeccionModel } from '../models/tipo-seccion.model';
import { SeccionController } from './seccion.controller';
import { SeccionService } from './seccion.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SeccionModel,
      SerieModel,
      SubSerieModel,
      SubsubSerieModel,
      SubfondoModel,
      TipoSeccionModel,
      SeccionDirModel,
      TipoDocModel,
      TipoDocSerieModel,
    ]),
    SequelizeModule.forFeature([TDepartamento, TDireccion], 'saf'),
  ],
  controllers: [SeccionController],
  providers: [SeccionService],
})
export class SeccionModule {}
