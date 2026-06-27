import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoExpedienteTratamientosAttributes {
  id: number;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoExpedienteTratamientosPk = "id";
export type TipoExpedienteTratamientosId = TipoExpedienteTratamientos[TipoExpedienteTratamientosPk];
export type TipoExpedienteTratamientosOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type TipoExpedienteTratamientosCreationAttributes = Optional<TipoExpedienteTratamientosAttributes, TipoExpedienteTratamientosOptionalAttributes>;

export class TipoExpedienteTratamientos extends Model<TipoExpedienteTratamientosAttributes, TipoExpedienteTratamientosCreationAttributes> implements TipoExpedienteTratamientosAttributes {
  id!: number;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoExpedienteTratamientos {
    return TipoExpedienteTratamientos.init({
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
    tableName: 'tipo_expediente_tratamientos',
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
