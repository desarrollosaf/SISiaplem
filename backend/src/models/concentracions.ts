import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ConcentracionsAttributes {
  id: number;
  id_inventario?: number;
  id_registro?: number;
  status?: number;
  id_inventario_fisico?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ConcentracionsPk = "id";
export type ConcentracionsId = Concentracions[ConcentracionsPk];
export type ConcentracionsOptionalAttributes = "id" | "id_inventario" | "id_registro" | "status" | "id_inventario_fisico" | "created_at" | "updated_at";
export type ConcentracionsCreationAttributes = Optional<ConcentracionsAttributes, ConcentracionsOptionalAttributes>;

export class Concentracions extends Model<ConcentracionsAttributes, ConcentracionsCreationAttributes> implements ConcentracionsAttributes {
  id!: number;
  id_inventario?: number;
  id_registro?: number;
  status?: number;
  id_inventario_fisico?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Concentracions {
    return Concentracions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_inventario: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_registro: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    id_inventario_fisico: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'concentracions',
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
