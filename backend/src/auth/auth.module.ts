import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModelHasRole } from '../models/model-has-role.model';
import { RoleModel } from '../models/role.model';
import { ModelHasPermission } from '../models/model-has-permission.model';
import { PermissionModel } from '../models/permission.model';
import { UsersSafs } from '../models/users-safs.model';
import { SUsuario } from '../models/s-usuario.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET', 'siaplem_secret_key'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
    SequelizeModule.forFeature([UsersSafs, SUsuario], 'saf'),
    SequelizeModule.forFeature([ModelHasRole, RoleModel, ModelHasPermission, PermissionModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
