import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ModelHasPermissions, ModelHasPermissionsId } from './model_has_permissions';
import type { RoleHasPermissions, RoleHasPermissionsId } from './role_has_permissions';
import type { Roles, RolesId } from './roles';

export interface PermissionsAttributes {
  id: number;
  name: string;
  guard_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type PermissionsPk = "id";
export type PermissionsId = Permissions[PermissionsPk];
export type PermissionsOptionalAttributes = "id" | "created_at" | "updated_at";
export type PermissionsCreationAttributes = Optional<PermissionsAttributes, PermissionsOptionalAttributes>;

export class Permissions extends Model<PermissionsAttributes, PermissionsCreationAttributes> implements PermissionsAttributes {
  id!: number;
  name!: string;
  guard_name!: string;
  created_at?: Date;
  updated_at?: Date;

  // Permissions hasMany ModelHasPermissions via permission_id
  model_has_permissions!: ModelHasPermissions[];
  getModel_has_permissions!: Sequelize.HasManyGetAssociationsMixin<ModelHasPermissions>;
  setModel_has_permissions!: Sequelize.HasManySetAssociationsMixin<ModelHasPermissions, ModelHasPermissionsId>;
  addModel_has_permission!: Sequelize.HasManyAddAssociationMixin<ModelHasPermissions, ModelHasPermissionsId>;
  addModel_has_permissions!: Sequelize.HasManyAddAssociationsMixin<ModelHasPermissions, ModelHasPermissionsId>;
  createModel_has_permission!: Sequelize.HasManyCreateAssociationMixin<ModelHasPermissions>;
  removeModel_has_permission!: Sequelize.HasManyRemoveAssociationMixin<ModelHasPermissions, ModelHasPermissionsId>;
  removeModel_has_permissions!: Sequelize.HasManyRemoveAssociationsMixin<ModelHasPermissions, ModelHasPermissionsId>;
  hasModel_has_permission!: Sequelize.HasManyHasAssociationMixin<ModelHasPermissions, ModelHasPermissionsId>;
  hasModel_has_permissions!: Sequelize.HasManyHasAssociationsMixin<ModelHasPermissions, ModelHasPermissionsId>;
  countModel_has_permissions!: Sequelize.HasManyCountAssociationsMixin;
  // Permissions hasMany RoleHasPermissions via permission_id
  role_has_permissions!: RoleHasPermissions[];
  getRole_has_permissions!: Sequelize.HasManyGetAssociationsMixin<RoleHasPermissions>;
  setRole_has_permissions!: Sequelize.HasManySetAssociationsMixin<RoleHasPermissions, RoleHasPermissionsId>;
  addRole_has_permission!: Sequelize.HasManyAddAssociationMixin<RoleHasPermissions, RoleHasPermissionsId>;
  addRole_has_permissions!: Sequelize.HasManyAddAssociationsMixin<RoleHasPermissions, RoleHasPermissionsId>;
  createRole_has_permission!: Sequelize.HasManyCreateAssociationMixin<RoleHasPermissions>;
  removeRole_has_permission!: Sequelize.HasManyRemoveAssociationMixin<RoleHasPermissions, RoleHasPermissionsId>;
  removeRole_has_permissions!: Sequelize.HasManyRemoveAssociationsMixin<RoleHasPermissions, RoleHasPermissionsId>;
  hasRole_has_permission!: Sequelize.HasManyHasAssociationMixin<RoleHasPermissions, RoleHasPermissionsId>;
  hasRole_has_permissions!: Sequelize.HasManyHasAssociationsMixin<RoleHasPermissions, RoleHasPermissionsId>;
  countRole_has_permissions!: Sequelize.HasManyCountAssociationsMixin;
  // Permissions belongsToMany Roles via permission_id and role_id
  role_id_roles!: Roles[];
  getRole_id_roles!: Sequelize.BelongsToManyGetAssociationsMixin<Roles>;
  setRole_id_roles!: Sequelize.BelongsToManySetAssociationsMixin<Roles, RolesId>;
  addRole_id_role!: Sequelize.BelongsToManyAddAssociationMixin<Roles, RolesId>;
  addRole_id_roles!: Sequelize.BelongsToManyAddAssociationsMixin<Roles, RolesId>;
  createRole_id_role!: Sequelize.BelongsToManyCreateAssociationMixin<Roles>;
  removeRole_id_role!: Sequelize.BelongsToManyRemoveAssociationMixin<Roles, RolesId>;
  removeRole_id_roles!: Sequelize.BelongsToManyRemoveAssociationsMixin<Roles, RolesId>;
  hasRole_id_role!: Sequelize.BelongsToManyHasAssociationMixin<Roles, RolesId>;
  hasRole_id_roles!: Sequelize.BelongsToManyHasAssociationsMixin<Roles, RolesId>;
  countRole_id_roles!: Sequelize.BelongsToManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Permissions {
    return Permissions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    guard_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "permissions_name_guard_name_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
          { name: "guard_name" },
        ]
      },
    ]
  });
  }
}
