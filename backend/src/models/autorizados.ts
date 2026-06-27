import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AutorizadosAttributes {
  id: number;
  rfc_jfe?: string;
  rfc_personal?: string;
  status?: number;
}

export type AutorizadosPk = "id";
export type AutorizadosId = Autorizados[AutorizadosPk];
export type AutorizadosOptionalAttributes = "id" | "rfc_jfe" | "rfc_personal" | "status";
export type AutorizadosCreationAttributes = Optional<AutorizadosAttributes, AutorizadosOptionalAttributes>;

export class Autorizados extends Model<AutorizadosAttributes, AutorizadosCreationAttributes> implements AutorizadosAttributes {
  id!: number;
  rfc_jfe?: string;
  rfc_personal?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof Autorizados {
    return Autorizados.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rfc_jfe: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    rfc_personal: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'autorizados',
    timestamps: false,
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
