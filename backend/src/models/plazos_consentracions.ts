import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface PlazosConsentracionsAttributes {
  id: number;
  valor?: string;
  status?: number;
}

export type PlazosConsentracionsPk = "id";
export type PlazosConsentracionsId = PlazosConsentracions[PlazosConsentracionsPk];
export type PlazosConsentracionsOptionalAttributes = "id" | "valor" | "status";
export type PlazosConsentracionsCreationAttributes = Optional<PlazosConsentracionsAttributes, PlazosConsentracionsOptionalAttributes>;

export class PlazosConsentracions extends Model<PlazosConsentracionsAttributes, PlazosConsentracionsCreationAttributes> implements PlazosConsentracionsAttributes {
  id!: number;
  valor?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof PlazosConsentracions {
    return PlazosConsentracions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'plazos_consentracions',
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
