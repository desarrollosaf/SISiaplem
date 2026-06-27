import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Permissions, PermissionsId } from './permissions';

export interface ModelHasPermissionsAttributes {
  permission_id: number;
  model_type: string;
  model_id: number;
}

export type ModelHasPermissionsPk = "permission_id" | "model_type" | "model_id";
export type ModelHasPermissionsId = ModelHasPermissions[ModelHasPermissionsPk];
export type ModelHasPermissionsCreationAttributes = ModelHasPermissionsAttributes;

export class ModelHasPermissions extends Model<ModelHasPermissionsAttributes, ModelHasPermissionsCreationAttributes> implements ModelHasPermissionsAttributes {
  permission_id!: number;
  model_type!: string;
  model_id!: number;

  // ModelHasPermissions belongsTo Permissions via permission_id
  permission!: Permissions;
  getPermission!: Sequelize.BelongsToGetAssociationMixin<Permissions>;
  setPermission!: Sequelize.BelongsToSetAssociationMixin<Permissions, PermissionsId>;
  createPermission!: Sequelize.BelongsToCreateAssociationMixin<Permissions>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ModelHasPermissions {
    return ModelHasPermissions.init({
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    model_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    model_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'model_has_permissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
      {
        name: "model_has_permissions_model_id_model_type_index",
        using: "BTREE",
        fields: [
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
    ]
  });
  }
}
