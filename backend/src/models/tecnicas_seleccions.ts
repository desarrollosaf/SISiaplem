import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TecnicasSeleccionsAttributes {
  id: number;
  valor?: string;
  status?: number;
}

export type TecnicasSeleccionsPk = "id";
export type TecnicasSeleccionsId = TecnicasSeleccions[TecnicasSeleccionsPk];
export type TecnicasSeleccionsOptionalAttributes = "id" | "valor" | "status";
export type TecnicasSeleccionsCreationAttributes = Optional<TecnicasSeleccionsAttributes, TecnicasSeleccionsOptionalAttributes>;

export class TecnicasSeleccions extends Model<TecnicasSeleccionsAttributes, TecnicasSeleccionsCreationAttributes> implements TecnicasSeleccionsAttributes {
  id!: number;
  valor?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof TecnicasSeleccions {
    return TecnicasSeleccions.init({
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
    tableName: 'tecnicas_seleccions',
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
