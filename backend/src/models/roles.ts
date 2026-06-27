import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ModelHasRoles, ModelHasRolesId } from './model_has_roles';
import type { Permissions, PermissionsId } from './permissions';
import type { RoleHasPermissions, RoleHasPermissionsId } from './role_has_permissions';

export interface RolesAttributes {
  id: number;
  name: string;
  guard_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RolesPk = "id";
export type RolesId = Roles[RolesPk];
export type RolesOptionalAttributes = "id" | "created_at" | "updated_at";
export type RolesCreationAttributes = Optional<RolesAttributes, RolesOptionalAttributes>;

export class Roles extends Model<RolesAttributes, RolesCreationAttributes> implements RolesAttributes {
  id!: number;
  name!: string;
  guard_name!: string;
  created_at?: Date;
  updated_at?: Date;

  // Roles hasMany ModelHasRoles via role_id
  model_has_roles!: ModelHasRoles[];
  getModel_has_roles!: Sequelize.HasManyGetAssociationsMixin<ModelHasRoles>;
  setModel_has_roles!: Sequelize.HasManySetAssociationsMixin<ModelHasRoles, ModelHasRolesId>;
  addModel_has_role!: Sequelize.HasManyAddAssociationMixin<ModelHasRoles, ModelHasRolesId>;
  addModel_has_roles!: Sequelize.HasManyAddAssociationsMixin<ModelHasRoles, ModelHasRolesId>;
  createModel_has_role!: Sequelize.HasManyCreateAssociationMixin<ModelHasRoles>;
  removeModel_has_role!: Sequelize.HasManyRemoveAssociationMixin<ModelHasRoles, ModelHasRolesId>;
  removeModel_has_roles!: Sequelize.HasManyRemoveAssociationsMixin<ModelHasRoles, ModelHasRolesId>;
  hasModel_has_role!: Sequelize.HasManyHasAssociationMixin<ModelHasRoles, ModelHasRolesId>;
  hasModel_has_roles!: Sequelize.HasManyHasAssociationsMixin<ModelHasRoles, ModelHasRolesId>;
  countModel_has_roles!: Sequelize.HasManyCountAssociationsMixin;
  // Roles belongsToMany Permissions via role_id and permission_id
  permission_id_permissions!: Permissions[];
  getPermission_id_permissions!: Sequelize.BelongsToManyGetAssociationsMixin<Permissions>;
  setPermission_id_permissions!: Sequelize.BelongsToManySetAssociationsMixin<Permissions, PermissionsId>;
  addPermission_id_permission!: Sequelize.BelongsToManyAddAssociationMixin<Permissions, PermissionsId>;
  addPermission_id_permissions!: Sequelize.BelongsToManyAddAssociationsMixin<Permissions, PermissionsId>;
  createPermission_id_permission!: Sequelize.BelongsToManyCreateAssociationMixin<Permissions>;
  removePermission_id_permission!: Sequelize.BelongsToManyRemoveAssociationMixin<Permissions, PermissionsId>;
  removePermission_id_permissions!: Sequelize.BelongsToManyRemoveAssociationsMixin<Permissions, PermissionsId>;
  hasPermission_id_permission!: Sequelize.BelongsToManyHasAssociationMixin<Permissions, PermissionsId>;
  hasPermission_id_permissions!: Sequelize.BelongsToManyHasAssociationsMixin<Permissions, PermissionsId>;
  countPermission_id_permissions!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Roles hasMany RoleHasPermissions via role_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof Roles {
    return Roles.init({
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
    tableName: 'roles',
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
        name: "roles_name_guard_name_unique",
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
