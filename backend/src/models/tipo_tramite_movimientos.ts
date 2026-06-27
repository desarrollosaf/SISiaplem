import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoTramiteMovimientosAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoTramiteMovimientosPk = "id";
export type TipoTramiteMovimientosId = TipoTramiteMovimientos[TipoTramiteMovimientosPk];
export type TipoTramiteMovimientosOptionalAttributes = "id" | "created_at" | "updated_at";
export type TipoTramiteMovimientosCreationAttributes = Optional<TipoTramiteMovimientosAttributes, TipoTramiteMovimientosOptionalAttributes>;

export class TipoTramiteMovimientos extends Model<TipoTramiteMovimientosAttributes, TipoTramiteMovimientosCreationAttributes> implements TipoTramiteMovimientosAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoTramiteMovimientos {
    return TipoTramiteMovimientos.init({
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
    tableName: 'tipo_tramite_movimientos',
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
