import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface FirmaDocsAttributes {
  id: number;
  path_doc?: string;
  nombre_doc: string;
  uuid_doc: string;
  rfc_registro: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type FirmaDocsPk = "id";
export type FirmaDocsId = FirmaDocs[FirmaDocsPk];
export type FirmaDocsOptionalAttributes = "id" | "path_doc" | "status" | "created_at" | "updated_at";
export type FirmaDocsCreationAttributes = Optional<FirmaDocsAttributes, FirmaDocsOptionalAttributes>;

export class FirmaDocs extends Model<FirmaDocsAttributes, FirmaDocsCreationAttributes> implements FirmaDocsAttributes {
  id!: number;
  path_doc?: string;
  nombre_doc!: string;
  uuid_doc!: string;
  rfc_registro!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof FirmaDocs {
    return FirmaDocs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    path_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombre_doc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    uuid_doc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rfc_registro: {
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
    tableName: 'firma_docs',
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
