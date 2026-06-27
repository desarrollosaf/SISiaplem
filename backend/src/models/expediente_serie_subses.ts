import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpedienteSerieSubsesAttributes {
  id: number;
  id_serie?: number;
  id_subserie?: number;
  nombre_ex?: string;
  fecha_cierre_exp?: string;
  status: number;
  anio?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type ExpedienteSerieSubsesPk = "id";
export type ExpedienteSerieSubsesId = ExpedienteSerieSubses[ExpedienteSerieSubsesPk];
export type ExpedienteSerieSubsesOptionalAttributes = "id" | "id_serie" | "id_subserie" | "nombre_ex" | "fecha_cierre_exp" | "status" | "anio" | "created_at" | "updated_at";
export type ExpedienteSerieSubsesCreationAttributes = Optional<ExpedienteSerieSubsesAttributes, ExpedienteSerieSubsesOptionalAttributes>;

export class ExpedienteSerieSubses extends Model<ExpedienteSerieSubsesAttributes, ExpedienteSerieSubsesCreationAttributes> implements ExpedienteSerieSubsesAttributes {
  id!: number;
  id_serie?: number;
  id_subserie?: number;
  nombre_ex?: string;
  fecha_cierre_exp?: string;
  status!: number;
  anio?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpedienteSerieSubses {
    return ExpedienteSerieSubses.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombre_ex: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_cierre_exp: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    anio: {
      type: DataTypes.STRING(4),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'expediente_serie_subses',
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
