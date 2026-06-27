import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ValorDocumentalsAttributes {
  id: number;
  valor?: string;
  status?: number;
}

export type ValorDocumentalsPk = "id";
export type ValorDocumentalsId = ValorDocumentals[ValorDocumentalsPk];
export type ValorDocumentalsOptionalAttributes = "id" | "valor" | "status";
export type ValorDocumentalsCreationAttributes = Optional<ValorDocumentalsAttributes, ValorDocumentalsOptionalAttributes>;

export class ValorDocumentals extends Model<ValorDocumentalsAttributes, ValorDocumentalsCreationAttributes> implements ValorDocumentalsAttributes {
  id!: number;
  valor?: string;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof ValorDocumentals {
    return ValorDocumentals.init({
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
    tableName: 'valor_documentals',
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
