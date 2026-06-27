import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RegistroFisicosAttributes {
  id: number;
  folio?: string;
  folio_rastreo?: string;
  fecha_recepcion?: string;
  fecha_documento?: string;
  referencia_documento?: string;
  fecha_limite_atencion?: string;
  tipo_atencion?: number;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  titulo_doc?: string;
  descripcion_doc?: string;
  user_registro_rfc?: string;
  remitente_rfc?: string;
  nombre_remitente?: string;
  app_remitente?: string;
  apm_remitente?: string;
  depend_remitente?: string;
  cargo_remitente?: string;
  tel_remitente?: string;
  fojas?: number;
  status: number;
  activo: number;
  uuid?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RegistroFisicosPk = "id";
export type RegistroFisicosId = RegistroFisicos[RegistroFisicosPk];
export type RegistroFisicosOptionalAttributes = "id" | "folio" | "folio_rastreo" | "fecha_recepcion" | "fecha_documento" | "referencia_documento" | "fecha_limite_atencion" | "tipo_atencion" | "serie_id" | "subserie_id" | "expediente_id" | "titulo_doc" | "descripcion_doc" | "user_registro_rfc" | "remitente_rfc" | "nombre_remitente" | "app_remitente" | "apm_remitente" | "depend_remitente" | "cargo_remitente" | "tel_remitente" | "fojas" | "status" | "activo" | "uuid" | "created_at" | "updated_at";
export type RegistroFisicosCreationAttributes = Optional<RegistroFisicosAttributes, RegistroFisicosOptionalAttributes>;

export class RegistroFisicos extends Model<RegistroFisicosAttributes, RegistroFisicosCreationAttributes> implements RegistroFisicosAttributes {
  id!: number;
  folio?: string;
  folio_rastreo?: string;
  fecha_recepcion?: string;
  fecha_documento?: string;
  referencia_documento?: string;
  fecha_limite_atencion?: string;
  tipo_atencion?: number;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  titulo_doc?: string;
  descripcion_doc?: string;
  user_registro_rfc?: string;
  remitente_rfc?: string;
  nombre_remitente?: string;
  app_remitente?: string;
  apm_remitente?: string;
  depend_remitente?: string;
  cargo_remitente?: string;
  tel_remitente?: string;
  fojas?: number;
  status!: number;
  activo!: number;
  uuid?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof RegistroFisicos {
    return RegistroFisicos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    folio_rastreo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_recepcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_documento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    referencia_documento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_limite_atencion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tipo_atencion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    serie_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subserie_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expediente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    titulo_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripcion_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_registro_rfc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    remitente_rfc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombre_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    app_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    apm_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    depend_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cargo_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tel_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fojas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registro_fisicos',
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
