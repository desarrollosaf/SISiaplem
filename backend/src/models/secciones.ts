import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SeccionesAttributes {
  id: number;
  codigo: string;
  seccion: string;
  direccion_id?: number;
  departamento_id?: string;
  status: number;
  id_subfondo?: number;
  id_tipo_seccion?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type SeccionesPk = "id";
export type SeccionesId = Secciones[SeccionesPk];
export type SeccionesOptionalAttributes = "id" | "direccion_id" | "departamento_id" | "status" | "id_subfondo" | "id_tipo_seccion" | "created_at" | "updated_at";
export type SeccionesCreationAttributes = Optional<SeccionesAttributes, SeccionesOptionalAttributes>;

export class Secciones extends Model<SeccionesAttributes, SeccionesCreationAttributes> implements SeccionesAttributes {
  id!: number;
  codigo!: string;
  seccion!: string;
  direccion_id?: number;
  departamento_id?: string;
  status!: number;
  id_subfondo?: number;
  id_tipo_seccion?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Secciones {
    return Secciones.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    codigo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    seccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    departamento_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    id_subfondo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tipo_seccion: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'secciones',
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
