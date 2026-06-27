import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SolicitudClasificacionsAttributes {
  id: number;
  rfc_solicita: string;
  id_departamento: number;
  tipo: number;
  tipoMov: number;
  motivo: string;
  codigo?: string;
  adicion?: string;
  id_serie?: number;
  id_subserie?: number;
  id_subsubserie?: number;
  status_solicitud: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type SolicitudClasificacionsPk = "id";
export type SolicitudClasificacionsId = SolicitudClasificacions[SolicitudClasificacionsPk];
export type SolicitudClasificacionsOptionalAttributes = "id" | "codigo" | "adicion" | "id_serie" | "id_subserie" | "id_subsubserie" | "status_solicitud" | "status" | "created_at" | "updated_at";
export type SolicitudClasificacionsCreationAttributes = Optional<SolicitudClasificacionsAttributes, SolicitudClasificacionsOptionalAttributes>;

export class SolicitudClasificacions extends Model<SolicitudClasificacionsAttributes, SolicitudClasificacionsCreationAttributes> implements SolicitudClasificacionsAttributes {
  id!: number;
  rfc_solicita!: string;
  id_departamento!: number;
  tipo!: number;
  tipoMov!: number;
  motivo!: string;
  codigo?: string;
  adicion?: string;
  id_serie?: number;
  id_subserie?: number;
  id_subsubserie?: number;
  status_solicitud!: number;
  status!: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof SolicitudClasificacions {
    return SolicitudClasificacions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    rfc_solicita: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_departamento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipoMov: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    adicion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subsubserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_solicitud: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'solicitud_clasificacions',
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
