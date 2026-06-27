import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface InventarioConcentracionsAttributes {
  id: number;
  rcf_solicitante?: string;
  id_Departamento?: number;
  fecha_validacion?: string;
  total_fojas?: number;
  total_cajas?: number;
  rfc_valida?: string;
  status?: number;
  id_inventario_fisico?: number;
  tipo_expediente?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type InventarioConcentracionsPk = "id";
export type InventarioConcentracionsId = InventarioConcentracions[InventarioConcentracionsPk];
export type InventarioConcentracionsOptionalAttributes = "id" | "rcf_solicitante" | "id_Departamento" | "fecha_validacion" | "total_fojas" | "total_cajas" | "rfc_valida" | "status" | "id_inventario_fisico" | "tipo_expediente" | "created_at" | "updated_at";
export type InventarioConcentracionsCreationAttributes = Optional<InventarioConcentracionsAttributes, InventarioConcentracionsOptionalAttributes>;

export class InventarioConcentracions extends Model<InventarioConcentracionsAttributes, InventarioConcentracionsCreationAttributes> implements InventarioConcentracionsAttributes {
  id!: number;
  rcf_solicitante?: string;
  id_Departamento?: number;
  fecha_validacion?: string;
  total_fojas?: number;
  total_cajas?: number;
  rfc_valida?: string;
  status?: number;
  id_inventario_fisico?: number;
  tipo_expediente?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof InventarioConcentracions {
    return InventarioConcentracions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rcf_solicitante: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    id_Departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_validacion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    total_fojas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_cajas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rfc_valida: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    id_inventario_fisico: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipo_expediente: {
      type: DataTypes.STRING(11),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'inventario_concentracions',
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
