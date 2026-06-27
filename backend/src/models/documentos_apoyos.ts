import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DocumentosApoyosAttributes {
  id: number;
  tipo_apoyo_id: number;
  tipo: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type DocumentosApoyosPk = "id";
export type DocumentosApoyosId = DocumentosApoyos[DocumentosApoyosPk];
export type DocumentosApoyosOptionalAttributes = "id" | "status" | "created_at" | "updated_at";
export type DocumentosApoyosCreationAttributes = Optional<DocumentosApoyosAttributes, DocumentosApoyosOptionalAttributes>;

export class DocumentosApoyos extends Model<DocumentosApoyosAttributes, DocumentosApoyosCreationAttributes> implements DocumentosApoyosAttributes {
  id!: number;
  tipo_apoyo_id!: number;
  tipo!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof DocumentosApoyos {
    return DocumentosApoyos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tipo_apoyo_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'documentos_apoyos',
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
