import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface FoliosAttributes {
  id: number;
  id_departamento?: number;
  folio: number;
  uAdmin: number;
  anio: number;
  created_at?: Date;
  updated_at?: Date;
}

export type FoliosPk = "id";
export type FoliosId = Folios[FoliosPk];
export type FoliosOptionalAttributes = "id" | "id_departamento" | "folio" | "uAdmin" | "anio" | "created_at" | "updated_at";
export type FoliosCreationAttributes = Optional<FoliosAttributes, FoliosOptionalAttributes>;

export class Folios extends Model<FoliosAttributes, FoliosCreationAttributes> implements FoliosAttributes {
  id!: number;
  id_departamento?: number;
  folio!: number;
  uAdmin!: number;
  anio!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Folios {
    return Folios.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    folio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    uAdmin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'folios',
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
