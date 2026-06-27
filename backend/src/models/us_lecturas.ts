import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface UsLecturasAttributes {
  id: number;
  user_rfc: string;
  rfc_jefe?: string;
  id_jefe?: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type UsLecturasPk = "id";
export type UsLecturasId = UsLecturas[UsLecturasPk];
export type UsLecturasOptionalAttributes = "id" | "rfc_jefe" | "id_jefe" | "status" | "created_at" | "updated_at";
export type UsLecturasCreationAttributes = Optional<UsLecturasAttributes, UsLecturasOptionalAttributes>;

export class UsLecturas extends Model<UsLecturasAttributes, UsLecturasCreationAttributes> implements UsLecturasAttributes {
  id!: number;
  user_rfc!: string;
  rfc_jefe?: string;
  id_jefe?: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof UsLecturas {
    return UsLecturas.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rfc_jefe: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_jefe: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'us_lecturas',
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
