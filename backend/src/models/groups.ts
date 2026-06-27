import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface GroupsAttributes {
  id: number;
  grupo: string;
  activo: number;
  created_at?: Date;
  updated_at?: Date;
}

export type GroupsPk = "id";
export type GroupsId = Groups[GroupsPk];
export type GroupsOptionalAttributes = "id" | "activo" | "created_at" | "updated_at";
export type GroupsCreationAttributes = Optional<GroupsAttributes, GroupsOptionalAttributes>;

export class Groups extends Model<GroupsAttributes, GroupsCreationAttributes> implements GroupsAttributes {
  id!: number;
  grupo!: string;
  activo!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Groups {
    return Groups.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    grupo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'groups',
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
    ]
  });
  }
}
