import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoDocSerieAttributes {
  id: number;
  id_serie?: number;
  id_subserie?: number;
  id_subsubserie?: number;
  id_tipo_doc?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoDocSeriePk = "id";
export type TipoDocSerieId = TipoDocSerie[TipoDocSeriePk];
export type TipoDocSerieOptionalAttributes = "id" | "id_serie" | "id_subserie" | "id_subsubserie" | "id_tipo_doc" | "created_at" | "updated_at";
export type TipoDocSerieCreationAttributes = Optional<TipoDocSerieAttributes, TipoDocSerieOptionalAttributes>;

export class TipoDocSerie extends Model<TipoDocSerieAttributes, TipoDocSerieCreationAttributes> implements TipoDocSerieAttributes {
  id!: number;
  id_serie?: number;
  id_subserie?: number;
  id_subsubserie?: number;
  id_tipo_doc?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoDocSerie {
    return TipoDocSerie.init({
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
    id_subsubserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tipo_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tipo_doc_serie',
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
