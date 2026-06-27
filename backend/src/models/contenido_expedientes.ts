import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ContenidoExpedientesAttributes {
  id: number;
  id_expediente: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ContenidoExpedientesPk = "id";
export type ContenidoExpedientesId = ContenidoExpedientes[ContenidoExpedientesPk];
export type ContenidoExpedientesOptionalAttributes = "id" | "created_at" | "updated_at";
export type ContenidoExpedientesCreationAttributes = Optional<ContenidoExpedientesAttributes, ContenidoExpedientesOptionalAttributes>;

export class ContenidoExpedientes extends Model<ContenidoExpedientesAttributes, ContenidoExpedientesCreationAttributes> implements ContenidoExpedientesAttributes {
  id!: number;
  id_expediente!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ContenidoExpedientes {
    return ContenidoExpedientes.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_expediente: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'contenido_expedientes',
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
