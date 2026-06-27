import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ValorDocumentalSerieSubserieAttributes {
  id: number;
  id_serie?: number;
  id_subserie?: number;
  id_valor?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ValorDocumentalSerieSubseriePk = "id";
export type ValorDocumentalSerieSubserieId = ValorDocumentalSerieSubserie[ValorDocumentalSerieSubseriePk];
export type ValorDocumentalSerieSubserieOptionalAttributes = "id" | "id_serie" | "id_subserie" | "id_valor" | "status" | "created_at" | "updated_at";
export type ValorDocumentalSerieSubserieCreationAttributes = Optional<ValorDocumentalSerieSubserieAttributes, ValorDocumentalSerieSubserieOptionalAttributes>;

export class ValorDocumentalSerieSubserie extends Model<ValorDocumentalSerieSubserieAttributes, ValorDocumentalSerieSubserieCreationAttributes> implements ValorDocumentalSerieSubserieAttributes {
  id!: number;
  id_serie?: number;
  id_subserie?: number;
  id_valor?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ValorDocumentalSerieSubserie {
    return ValorDocumentalSerieSubserie.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_valor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'valor_documental_serie_subserie',
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
