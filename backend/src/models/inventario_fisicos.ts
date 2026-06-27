import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface InventarioFisicosAttributes {
  id: number;
  nombre_expediente?: string;
  anio?: string;
  total_legajos?: number;
  total_docs?: number;
  fecha_inicial?: string;
  fecha_final?: string;
  rfc_responsable?: string;
  id_Departamento?: number;
  status?: number;
  id_responsable?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type InventarioFisicosPk = "id";
export type InventarioFisicosId = InventarioFisicos[InventarioFisicosPk];
export type InventarioFisicosOptionalAttributes = "id" | "nombre_expediente" | "anio" | "total_legajos" | "total_docs" | "fecha_inicial" | "fecha_final" | "rfc_responsable" | "id_Departamento" | "status" | "id_responsable" | "created_at" | "updated_at";
export type InventarioFisicosCreationAttributes = Optional<InventarioFisicosAttributes, InventarioFisicosOptionalAttributes>;

export class InventarioFisicos extends Model<InventarioFisicosAttributes, InventarioFisicosCreationAttributes> implements InventarioFisicosAttributes {
  id!: number;
  nombre_expediente?: string;
  anio?: string;
  total_legajos?: number;
  total_docs?: number;
  fecha_inicial?: string;
  fecha_final?: string;
  rfc_responsable?: string;
  id_Departamento?: number;
  status?: number;
  id_responsable?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof InventarioFisicos {
    return InventarioFisicos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_expediente: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    anio: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    total_legajos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_docs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_inicial: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_final: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    rfc_responsable: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_Departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    id_responsable: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'inventario_fisicos',
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
