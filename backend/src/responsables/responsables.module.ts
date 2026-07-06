import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { TipoUsuarioModel } from '../models/tipos-usuario.model';
import { ModelHasRole } from '../models/model-has-role.model';
import { RoleModel } from '../models/role.model';
import { TDependencia } from '../models/t-dependencia.model';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SUsuario } from '../models/s-usuario.model';
import { UsersSafs } from '../models/users-safs.model';
import { ResponsablesController } from './responsables.controller';
import { ResponsablesService } from './responsables.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ResponsableArchivoModel, TipoUsuarioModel, ModelHasRole, RoleModel]),
    SequelizeModule.forFeature([TDependencia, TDepartamento, TDireccion, SUsuario, UsersSafs], 'saf'),
  ],
  controllers: [ResponsablesController],
  providers: [ResponsablesService],
})
export class ResponsablesModule {}
