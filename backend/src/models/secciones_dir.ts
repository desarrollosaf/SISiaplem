import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SeccionesDirAttributes {
  id: number;
  id_seccion?: number;
  id_Departamento?: number;
  STATUS?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type SeccionesDirPk = "id";
export type SeccionesDirId = SeccionesDir[SeccionesDirPk];
export type SeccionesDirOptionalAttributes = "id" | "id_seccion" | "id_Departamento" | "STATUS" | "created_at" | "updated_at" | "deleted_at";
export type SeccionesDirCreationAttributes = Optional<SeccionesDirAttributes, SeccionesDirOptionalAttributes>;

export class SeccionesDir extends Model<SeccionesDirAttributes, SeccionesDirCreationAttributes> implements SeccionesDirAttributes {
  id!: number;
  id_seccion?: number;
  id_Departamento?: number;
  STATUS?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof SeccionesDir {
    return SeccionesDir.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_seccion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_Departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'secciones_dir',
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
