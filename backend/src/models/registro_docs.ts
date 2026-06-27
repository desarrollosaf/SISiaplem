import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RegistroDocsAttributes {
  id: number;
  folio?: string;
  fojas?: number;
  titulo_doc?: string;
  path_doc?: string;
  uuid_doc?: string;
  path_acuse?: string;
  uuid_acuse?: string;
  rfc_registro?: string;
  firmado?: number;
  status: number;
  bloqueo?: number;
  activo: number;
  tipo_atencion?: string;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  tipo_doc?: number;
  apoyo_tipo_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type RegistroDocsPk = "id";
export type RegistroDocsId = RegistroDocs[RegistroDocsPk];
export type RegistroDocsOptionalAttributes = "id" | "folio" | "fojas" | "titulo_doc" | "path_doc" | "uuid_doc" | "path_acuse" | "uuid_acuse" | "rfc_registro" | "firmado" | "status" | "bloqueo" | "activo" | "tipo_atencion" | "serie_id" | "subserie_id" | "expediente_id" | "tipo_doc" | "apoyo_tipo_id" | "created_at" | "updated_at";
export type RegistroDocsCreationAttributes = Optional<RegistroDocsAttributes, RegistroDocsOptionalAttributes>;

export class RegistroDocs extends Model<RegistroDocsAttributes, RegistroDocsCreationAttributes> implements RegistroDocsAttributes {
  id!: number;
  folio?: string;
  fojas?: number;
  titulo_doc?: string;
  path_doc?: string;
  uuid_doc?: string;
  path_acuse?: string;
  uuid_acuse?: string;
  rfc_registro?: string;
  firmado?: number;
  status!: number;
  bloqueo?: number;
  activo!: number;
  tipo_atencion?: string;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  tipo_doc?: number;
  apoyo_tipo_id?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof RegistroDocs {
    return RegistroDocs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fojas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    titulo_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    uuid_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path_acuse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    uuid_acuse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rfc_registro: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    firmado: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    bloqueo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    tipo_atencion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    serie_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subserie_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expediente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipo_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    apoyo_tipo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registro_docs',
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
