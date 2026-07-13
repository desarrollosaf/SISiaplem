import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { UsersSafs } from '../models/users-safs.model';
import { SUsuario } from '../models/s-usuario.model';
import { ModelHasRole } from '../models/model-has-role.model';
import { RoleModel } from '../models/role.model';
import { ModelHasPermission } from '../models/model-has-permission.model';
import { PermissionModel } from '../models/permission.model';

export const MODEL_TYPE = 'App\\Models\\UsersSaf';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsersSafs, 'saf') private userModel: typeof UsersSafs,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
    @InjectModel(ModelHasRole) private mhrModel: typeof ModelHasRole,
    @InjectModel(RoleModel) private roleModel: typeof RoleModel,
    @InjectModel(ModelHasPermission) private mhpModel: typeof ModelHasPermission,
    @InjectModel(PermissionModel) private permissionModel: typeof PermissionModel,
    private jwt: JwtService,
  ) {}

  async login(rfc: string, password: string) {
    const user = await this.userModel.findOne({
      where: { rfc },
      include: [{ model: SUsuario, as: 'datos_user', attributes: ['Nombre'] }],
    });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const roles = await this.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);
    const name = user.name || user.datos_user?.Nombre || null;

    const payload = { sub: user.id, rfc: user.rfc, name, email: user.email, roles, permissions };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, name, rfc: user.rfc, email: user.email, roles, permissions },
    };
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

  async getUserPermissions(userId: number): Promise<string[]> {
    const pivots = await this.mhpModel.findAll({
      where: { model_id: userId, model_type: MODEL_TYPE },
      include: [{ model: PermissionModel, as: 'permission' }],
    });
    return pivots.map(p => p.permission?.name).filter(Boolean) as string[];
  }

  async getAllPermissions() {
    return this.permissionModel.findAll({ order: [['name', 'ASC']] });
  }

  // Solo usuarios que ya tienen algún rol o permiso asignado (evita traer las ~6000 filas de users_safs)
  async listUsers() {
    const [rolePivots, permPivots] = await Promise.all([
      this.mhrModel.findAll({ where: { model_type: MODEL_TYPE }, attributes: ['model_id'] }),
      this.mhpModel.findAll({ where: { model_type: MODEL_TYPE }, attributes: ['model_id'] }),
    ]);
    const userIds = [...new Set([...rolePivots, ...permPivots].map(p => p.model_id))];
    if (!userIds.length) return [];

    const users = await this.userModel.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'name', 'rfc', 'email', 'cambio_contrasena'],
      include: [{ model: SUsuario, as: 'datos_user', attributes: ['Nombre'] }],
      order: [['name', 'ASC']],
    });
    return this.attachRolesYPermisos(users);
  }

  // Búsqueda puntual para asignarle acceso a un usuario que aún no tiene rol/permiso
  async searchUsers(q: string) {
    if (!q || q.trim().length < 2) return [];
    const users = await this.userModel.findAll({
      where: {
        [Op.or]: [
          { rfc: { [Op.like]: `%${q}%` } },
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { '$datos_user.Nombre$': { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'name', 'rfc', 'email', 'cambio_contrasena'],
      include: [{ model: SUsuario, as: 'datos_user', attributes: ['Nombre'], required: false }],
      subQuery: false,
      order: [['name', 'ASC']],
      limit: 20,
    });
    return this.attachRolesYPermisos(users);
  }

  private async attachRolesYPermisos(users: UsersSafs[]) {
    return Promise.all(
      users.map(async u => ({
        id: u.id,
        name: u.name || u.datos_user?.Nombre || null,
        rfc: u.rfc,
        email: u.email,
        cambio_contrasena: u.cambio_contrasena,
        roles: await this.getUserRoles(u.id),
        permissions: await this.getUserPermissions(u.id),
      })),
    );
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

  async assignPermission(userId: number, permissionName: string) {
    const permission = await this.permissionModel.findOne({ where: { name: permissionName } });
    if (!permission) throw new UnauthorizedException(`Permiso '${permissionName}' no existe`);

    const [record] = await this.mhpModel.findOrCreate({
      where: { permission_id: permission.id, model_type: MODEL_TYPE, model_id: userId },
      defaults: { permission_id: permission.id, model_type: MODEL_TYPE, model_id: userId },
    });
    return record;
  }

  async removePermission(userId: number, permissionName: string) {
    const permission = await this.permissionModel.findOne({ where: { name: permissionName } });
    if (!permission) return;
    await this.mhpModel.destroy({ where: { permission_id: permission.id, model_type: MODEL_TYPE, model_id: userId } });
  }
}
