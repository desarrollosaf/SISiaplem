import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Roles, RolesId } from './roles';

export interface ModelHasRolesAttributes {
  role_id: number;
  model_type: string;
  model_id: number;
}

export type ModelHasRolesPk = "role_id" | "model_type" | "model_id";
export type ModelHasRolesId = ModelHasRoles[ModelHasRolesPk];
export type ModelHasRolesCreationAttributes = ModelHasRolesAttributes;

export class ModelHasRoles extends Model<ModelHasRolesAttributes, ModelHasRolesCreationAttributes> implements ModelHasRolesAttributes {
  role_id!: number;
  model_type!: string;
  model_id!: number;

  // ModelHasRoles belongsTo Roles via role_id
  role!: Roles;
  getRole!: Sequelize.BelongsToGetAssociationMixin<Roles>;
  setRole!: Sequelize.BelongsToSetAssociationMixin<Roles, RolesId>;
  createRole!: Sequelize.BelongsToCreateAssociationMixin<Roles>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ModelHasRoles {
    return ModelHasRoles.init({
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
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
    tableName: 'model_has_roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_id" },
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
      {
        name: "model_has_roles_model_id_model_type_index",
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
