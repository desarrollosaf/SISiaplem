import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SeriesAttributes {
  id: number;
  idSeccion: number;
  codigo: string;
  serie: string;
  departamento_id?: number;
  horarios: number;
  status: number;
  duracionSistema?: number;
  id_destino?: number;
  id_tecnica?: number;
  anio_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type SeriesPk = "id";
export type SeriesId = Series[SeriesPk];
export type SeriesOptionalAttributes = "id" | "departamento_id" | "horarios" | "status" | "duracionSistema" | "id_destino" | "id_tecnica" | "anio_tramite" | "anios_consentracion" | "total_anios" | "created_at" | "updated_at";
export type SeriesCreationAttributes = Optional<SeriesAttributes, SeriesOptionalAttributes>;

export class Series extends Model<SeriesAttributes, SeriesCreationAttributes> implements SeriesAttributes {
  id!: number;
  idSeccion!: number;
  codigo!: string;
  serie!: string;
  departamento_id?: number;
  horarios!: number;
  status!: number;
  duracionSistema?: number;
  id_destino?: number;
  id_tecnica?: number;
  anio_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Series {
    return Series.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    idSeccion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    serie: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    departamento_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    horarios: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    duracionSistema: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 730
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
    tableName: 'series',
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
