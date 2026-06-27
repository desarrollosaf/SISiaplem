import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ControlPermisosDocumentosAttributes {
  id: number;
  id_atencion?: number;
  id_atencion_permiso?: number;
  status?: number;
  id_documento_permiso?: number;
  doc_reemplazado?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ControlPermisosDocumentosPk = "id";
export type ControlPermisosDocumentosId = ControlPermisosDocumentos[ControlPermisosDocumentosPk];
export type ControlPermisosDocumentosOptionalAttributes = "id" | "id_atencion" | "id_atencion_permiso" | "status" | "id_documento_permiso" | "doc_reemplazado" | "created_at" | "updated_at";
export type ControlPermisosDocumentosCreationAttributes = Optional<ControlPermisosDocumentosAttributes, ControlPermisosDocumentosOptionalAttributes>;

export class ControlPermisosDocumentos extends Model<ControlPermisosDocumentosAttributes, ControlPermisosDocumentosCreationAttributes> implements ControlPermisosDocumentosAttributes {
  id!: number;
  id_atencion?: number;
  id_atencion_permiso?: number;
  status?: number;
  id_documento_permiso?: number;
  doc_reemplazado?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ControlPermisosDocumentos {
    return ControlPermisosDocumentos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_atencion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_atencion_permiso: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    id_documento_permiso: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    doc_reemplazado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'controlPermisosDocumentos',
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
