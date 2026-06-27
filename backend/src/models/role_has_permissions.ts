import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Permissions, PermissionsId } from './permissions';
import type { Roles, RolesId } from './roles';

export interface RoleHasPermissionsAttributes {
  permission_id: number;
  role_id: number;
}

export type RoleHasPermissionsPk = "permission_id" | "role_id";
export type RoleHasPermissionsId = RoleHasPermissions[RoleHasPermissionsPk];
export type RoleHasPermissionsCreationAttributes = RoleHasPermissionsAttributes;

export class RoleHasPermissions extends Model<RoleHasPermissionsAttributes, RoleHasPermissionsCreationAttributes> implements RoleHasPermissionsAttributes {
  permission_id!: number;
  role_id!: number;

  // RoleHasPermissions belongsTo Permissions via permission_id
  permission!: Permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<Permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<Permissions, PermissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<Permissions>;
  // RoleHasPermissions belongsTo Roles via role_id
  role!: Roles;
  getRole!: Sequelize.BelongsToGetAssociationMixin<Roles>;
  setRole!: Sequelize.BelongsToSetAssociationMixin<Roles, RolesId>;
  createRole!: Sequelize.BelongsToCreateAssociationMixin<Roles>;

  static initModel(sequelize: Sequelize.Sequelize): typeof RoleHasPermissions {
    return RoleHasPermissions.init({
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'role_has_permissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
          { name: "role_id" },
        ]
      },
      {
        name: "role_has_permissions_role_id_foreign",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });
  }
}
