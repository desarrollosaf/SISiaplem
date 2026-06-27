import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RemitentesAttributes {
  id: number;
  usuario_id: number;
  nombre_remitente: string;
  rfc_remitente: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RemitentesPk = "id";
export type RemitentesId = Remitentes[RemitentesPk];
export type RemitentesOptionalAttributes = "id" | "created_at" | "updated_at";
export type RemitentesCreationAttributes = Optional<RemitentesAttributes, RemitentesOptionalAttributes>;

export class Remitentes extends Model<RemitentesAttributes, RemitentesCreationAttributes> implements RemitentesAttributes {
  id!: number;
  usuario_id!: number;
  nombre_remitente!: string;
  rfc_remitente!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Remitentes {
    return Remitentes.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_remitente: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rfc_remitente: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'remitentes',
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
