import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface MembersAttributes {
  id: number;
  id_group: string;
  user_rfc: string;
  created_at?: Date;
  updated_at?: Date;
}

export type MembersPk = "id";
export type MembersId = Members[MembersPk];
export type MembersOptionalAttributes = "id" | "created_at" | "updated_at";
export type MembersCreationAttributes = Optional<MembersAttributes, MembersOptionalAttributes>;

export class Members extends Model<MembersAttributes, MembersCreationAttributes> implements MembersAttributes {
  id!: number;
  id_group!: string;
  user_rfc!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Members {
    return Members.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_group: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'members',
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
