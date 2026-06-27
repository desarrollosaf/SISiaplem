import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SubsubSeriesAttributes {
  id: number;
  codigo?: string;
  subsubserie?: string;
  idSubserie?: number;
  idSerie?: number;
  id_Departamento?: number;
  status: number;
  id_destino?: number;
  id_tecnica?: number;
  anio_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type SubsubSeriesPk = "id";
export type SubsubSeriesId = SubsubSeries[SubsubSeriesPk];
export type SubsubSeriesOptionalAttributes = "id" | "codigo" | "subsubserie" | "idSubserie" | "idSerie" | "id_Departamento" | "status" | "id_destino" | "id_tecnica" | "anio_tramite" | "anios_consentracion" | "total_anios" | "created_at" | "updated_at";
export type SubsubSeriesCreationAttributes = Optional<SubsubSeriesAttributes, SubsubSeriesOptionalAttributes>;

export class SubsubSeries extends Model<SubsubSeriesAttributes, SubsubSeriesCreationAttributes> implements SubsubSeriesAttributes {
  id!: number;
  codigo?: string;
  subsubserie?: string;
  idSubserie?: number;
  idSerie?: number;
  id_Departamento?: number;
  status!: number;
  id_destino?: number;
  id_tecnica?: number;
  anio_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof SubsubSeries {
    return SubsubSeries.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    codigo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    subsubserie: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    idSubserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idSerie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_Departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    id_destino: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tecnica: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    anio_tramite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    anios_consentracion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_anios: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'subsub_series',
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
