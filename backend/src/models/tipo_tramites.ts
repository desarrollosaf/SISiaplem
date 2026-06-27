import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoTramitesAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoTramitesPk = "id";
export type TipoTramitesId = TipoTramites[TipoTramitesPk];
export type TipoTramitesOptionalAttributes = "id" | "created_at" | "updated_at";
export type TipoTramitesCreationAttributes = Optional<TipoTramitesAttributes, TipoTramitesOptionalAttributes>;

export class TipoTramites extends Model<TipoTramitesAttributes, TipoTramitesCreationAttributes> implements TipoTramitesAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoTramites {
    return TipoTramites.init({
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
    tableName: 'tipo_tramites',
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
