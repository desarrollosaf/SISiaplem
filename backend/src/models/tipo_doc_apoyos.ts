import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoDocApoyosAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoDocApoyosPk = "id";
export type TipoDocApoyosId = TipoDocApoyos[TipoDocApoyosPk];
export type TipoDocApoyosOptionalAttributes = "id" | "created_at" | "updated_at";
export type TipoDocApoyosCreationAttributes = Optional<TipoDocApoyosAttributes, TipoDocApoyosOptionalAttributes>;

export class TipoDocApoyos extends Model<TipoDocApoyosAttributes, TipoDocApoyosCreationAttributes> implements TipoDocApoyosAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoDocApoyos {
    return TipoDocApoyos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipo_doc_apoyos',
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
