import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoAtencionsAttributes {
  id: number;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoAtencionsPk = "id";
export type TipoAtencionsId = TipoAtencions[TipoAtencionsPk];
export type TipoAtencionsOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type TipoAtencionsCreationAttributes = Optional<TipoAtencionsAttributes, TipoAtencionsOptionalAttributes>;

export class TipoAtencions extends Model<TipoAtencionsAttributes, TipoAtencionsCreationAttributes> implements TipoAtencionsAttributes {
  id!: number;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoAtencions {
    return TipoAtencions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'tipo_atencions',
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
