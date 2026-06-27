import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AtencionDocsAttributes {
  id: number;
  id_registro_doc: number;
  rfc_atencion: string;
  visto: number;
  fecha_visto?: Date;
  status_atencion: number;
  fecha_atencion?: Date;
  tipo_atencion: string;
  activo: number;
  rfc_turna?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type AtencionDocsPk = "id";
export type AtencionDocsId = AtencionDocs[AtencionDocsPk];
export type AtencionDocsOptionalAttributes = "id" | "visto" | "fecha_visto" | "status_atencion" | "fecha_atencion" | "activo" | "rfc_turna" | "created_at" | "updated_at";
export type AtencionDocsCreationAttributes = Optional<AtencionDocsAttributes, AtencionDocsOptionalAttributes>;

export class AtencionDocs extends Model<AtencionDocsAttributes, AtencionDocsCreationAttributes> implements AtencionDocsAttributes {
  id!: number;
  id_registro_doc!: number;
  rfc_atencion!: string;
  visto!: number;
  fecha_visto?: Date;
  status_atencion!: number;
  fecha_atencion?: Date;
  tipo_atencion!: string;
  activo!: number;
  rfc_turna?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof AtencionDocs {
    return AtencionDocs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_registro_doc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rfc_atencion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    fecha_visto: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status_atencion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    fecha_atencion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tipo_atencion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    rfc_turna: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'atencion_docs',
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
