import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DocumentosEnviosAttributes {
  id: number;
  registro_id?: number;
  registroF_id?: number;
  status_doc?: number;
  path?: string;
  uuid?: string;
  path_acuse?: string;
  uuid_acuse?: string;
  tipo_doc?: number;
  id_atencion?: number;
  id_serie?: number;
  id_subserie?: number;
  expediente_id?: number;
  fojas?: number;
  firmado?: number;
  clve?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type DocumentosEnviosPk = "id";
export type DocumentosEnviosId = DocumentosEnvios[DocumentosEnviosPk];
export type DocumentosEnviosOptionalAttributes = "id" | "registro_id" | "registroF_id" | "status_doc" | "path" | "uuid" | "path_acuse" | "uuid_acuse" | "tipo_doc" | "id_atencion" | "id_serie" | "id_subserie" | "expediente_id" | "fojas" | "firmado" | "clve" | "created_at" | "updated_at" | "deleted_at";
export type DocumentosEnviosCreationAttributes = Optional<DocumentosEnviosAttributes, DocumentosEnviosOptionalAttributes>;

export class DocumentosEnvios extends Model<DocumentosEnviosAttributes, DocumentosEnviosCreationAttributes> implements DocumentosEnviosAttributes {
  id!: number;
  registro_id?: number;
  registroF_id?: number;
  status_doc?: number;
  path?: string;
  uuid?: string;
  path_acuse?: string;
  uuid_acuse?: string;
  tipo_doc?: number;
  id_atencion?: number;
  id_serie?: number;
  id_subserie?: number;
  expediente_id?: number;
  fojas?: number;
  firmado?: number;
  clve?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof DocumentosEnvios {
    return DocumentosEnvios.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registro_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    registroF_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_doc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    path_acuse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uuid_acuse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_atencion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expediente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fojas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    firmado: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clve: {
      type: DataTypes.STRING(5),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'documentos_envios',
    timestamps: true,
    paranoid: true,
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
