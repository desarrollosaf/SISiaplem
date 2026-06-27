import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoExpedientesAttributes {
  id: number;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoExpedientesPk = "id";
export type TipoExpedientesId = TipoExpedientes[TipoExpedientesPk];
export type TipoExpedientesOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type TipoExpedientesCreationAttributes = Optional<TipoExpedientesAttributes, TipoExpedientesOptionalAttributes>;

export class TipoExpedientes extends Model<TipoExpedientesAttributes, TipoExpedientesCreationAttributes> implements TipoExpedientesAttributes {
  id!: number;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoExpedientes {
    return TipoExpedientes.init({
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
    tableName: 'tipo_expedientes',
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
