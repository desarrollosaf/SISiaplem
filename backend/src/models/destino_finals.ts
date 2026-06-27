import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DestinoFinalsAttributes {
  id: number;
  valor?: string;
  status?: number;
}

export type DestinoFinalsPk = "id";
export type DestinoFinalsId = DestinoFinals[DestinoFinalsPk];
export type DestinoFinalsOptionalAttributes = "id" | "valor" | "status";
export type DestinoFinalsCreationAttributes = Optional<DestinoFinalsAttributes, DestinoFinalsOptionalAttributes>;

export class DestinoFinals extends Model<DestinoFinalsAttributes, DestinoFinalsCreationAttributes> implements DestinoFinalsAttributes {
  id!: number;
  valor?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof DestinoFinals {
    return DestinoFinals.init({
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
    tableName: 'destino_finals',
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
