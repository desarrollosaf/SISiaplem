import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AtencionAttributes {
  id: number;
  id_registro_original?: number;
  desc_general?: string;
  rfc_registro?: string;
  status?: number;
  fecha_cancelacion?: Date;
  motivo_cancelacion?: string;
  created_at?: Date;
  updated_at?: Date;
  clve?: string;
}

export type AtencionPk = "id";
export type AtencionId = Atencion[AtencionPk];
export type AtencionOptionalAttributes = "id" | "id_registro_original" | "desc_general" | "rfc_registro" | "status" | "fecha_cancelacion" | "motivo_cancelacion" | "created_at" | "updated_at" | "clve";
export type AtencionCreationAttributes = Optional<AtencionAttributes, AtencionOptionalAttributes>;

export class Atencion extends Model<AtencionAttributes, AtencionCreationAttributes> implements AtencionAttributes {
  id!: number;
  id_registro_original?: number;
  desc_general?: string;
  rfc_registro?: string;
  status?: number;
  fecha_cancelacion?: Date;
  motivo_cancelacion?: string;
  created_at?: Date;
  updated_at?: Date;
  clve?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof Atencion {
    return Atencion.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_registro_original: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    desc_general: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rfc_registro: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    fecha_cancelacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_cancelacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clve: {
      type: DataTypes.STRING(5),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'atencion',
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
