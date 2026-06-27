import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoSeccionsAttributes {
  id: number;
  valor?: string;
  status?: number;
}

export type TipoSeccionsPk = "id";
export type TipoSeccionsId = TipoSeccions[TipoSeccionsPk];
export type TipoSeccionsOptionalAttributes = "id" | "valor" | "status";
export type TipoSeccionsCreationAttributes = Optional<TipoSeccionsAttributes, TipoSeccionsOptionalAttributes>;

export class TipoSeccions extends Model<TipoSeccionsAttributes, TipoSeccionsCreationAttributes> implements TipoSeccionsAttributes {
  id!: number;
  valor?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoSeccions {
    return TipoSeccions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tipo_seccions',
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
