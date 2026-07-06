import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { UsersSafs } from '../models/users-safs.model';
import { ModelHasRole } from '../models/model-has-role.model';
import { RoleModel } from '../models/role.model';

export const MODEL_TYPE = 'App\\Models\\UsersSaf';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsersSafs, 'saf') private userModel: typeof UsersSafs,
    @InjectModel(ModelHasRole) private mhrModel: typeof ModelHasRole,
    @InjectModel(RoleModel) private roleModel: typeof RoleModel,
    private jwt: JwtService,
  ) {}

  async login(rfc: string, password: string) {
    const user = await this.userModel.findOne({ where: { rfc } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const roles = await this.getUserRoles(user.id);

    const payload = { sub: user.id, rfc: user.rfc, name: user.name, email: user.email, roles };
    return { access_token: this.jwt.sign(payload), user: { id: user.id, name: user.name, rfc: user.rfc, email: user.email, roles } };
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const pivots = await this.mhrModel.findAll({
      where: { model_id: userId, model_type: MODEL_TYPE },
      include: [{ model: RoleModel, as: 'role' }],
    });
    return pivots.map(p => p.role?.name).filter(Boolean) as string[];
  }

  async getAllRoles() {
    return this.roleModel.findAll({ order: [['name', 'ASC']] });
  }

  async listUsers() {
    const users = await this.userModel.findAll({
      attributes: ['id', 'name', 'rfc', 'email', 'cambio_contrasena'],
      order: [['name', 'ASC']],
    });

    const withRoles = await Promise.all(
      users.map(async u => ({
        id: u.id,
        name: u.name,
        rfc: u.rfc,
        email: u.email,
        cambio_contrasena: u.cambio_contrasena,
        roles: await this.getUserRoles(u.id),
      })),
    );
    return withRoles;
  }

  async assignRole(userId: number, roleName: string) {
    const role = await this.roleModel.findOne({ where: { name: roleName } });
    if (!role) throw new UnauthorizedException(`Rol '${roleName}' no existe`);

    const [record] = await this.mhrModel.findOrCreate({
      where: { role_id: role.id, model_type: MODEL_TYPE, model_id: userId },
      defaults: { role_id: role.id, model_type: MODEL_TYPE, model_id: userId },
    });
    return record;
  }

  async removeRole(userId: number, roleName: string) {
    const role = await this.roleModel.findOne({ where: { name: roleName } });
    if (!role) return;
    await this.mhrModel.destroy({ where: { role_id: role.id, model_type: MODEL_TYPE, model_id: userId } });
  }
}
