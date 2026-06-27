import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoDocSeriesAttributes {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoDocSeriesPk = "id";
export type TipoDocSeriesId = TipoDocSeries[TipoDocSeriesPk];
export type TipoDocSeriesOptionalAttributes = "id" | "created_at" | "updated_at";
export type TipoDocSeriesCreationAttributes = Optional<TipoDocSeriesAttributes, TipoDocSeriesOptionalAttributes>;

export class TipoDocSeries extends Model<TipoDocSeriesAttributes, TipoDocSeriesCreationAttributes> implements TipoDocSeriesAttributes {
  id!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoDocSeries {
    return TipoDocSeries.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'tipo_doc_series',
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
