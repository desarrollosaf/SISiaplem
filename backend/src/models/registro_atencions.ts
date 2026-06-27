import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Registro, RegistroId } from './registro';

export interface RegistroAtencionsAttributes {
  id: number;
  registro_id?: number;
  user_rfc: string;
  visto: number;
  statusAtencion: number;
  tipoAtencion: string;
  indicaciones_turno?: string;
  user_turna?: string;
  activo: number;
  notificacion: number;
  id_atencion?: number;
  fechaCierre?: string;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type RegistroAtencionsPk = "id";
export type RegistroAtencionsId = RegistroAtencions[RegistroAtencionsPk];
export type RegistroAtencionsOptionalAttributes = "id" | "registro_id" | "visto" | "statusAtencion" | "indicaciones_turno" | "user_turna" | "activo" | "notificacion" | "id_atencion" | "fechaCierre" | "serie_id" | "subserie_id" | "expediente_id" | "created_at" | "updated_at";
export type RegistroAtencionsCreationAttributes = Optional<RegistroAtencionsAttributes, RegistroAtencionsOptionalAttributes>;

export class RegistroAtencions extends Model<RegistroAtencionsAttributes, RegistroAtencionsCreationAttributes> implements RegistroAtencionsAttributes {
  id!: number;
  registro_id?: number;
  user_rfc!: string;
  visto!: number;
  statusAtencion!: number;
  tipoAtencion!: string;
  indicaciones_turno?: string;
  user_turna?: string;
  activo!: number;
  notificacion!: number;
  id_atencion?: number;
  fechaCierre?: string;
  serie_id?: number;
  subserie_id?: number;
  expediente_id?: number;
  created_at?: Date;
  updated_at?: Date;

  // RegistroAtencions belongsTo Registro via registro_id
  registro!: Registro;
  getRegistro!: Sequelize.BelongsToGetAssociationMixin<Registro>;
  setRegistro!: Sequelize.BelongsToSetAssociationMixin<Registro, RegistroId>;
  createRegistro!: Sequelize.BelongsToCreateAssociationMixin<Registro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof RegistroAtencions {
    return RegistroAtencions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    registro_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'registro',
        key: 'id'
      }
    },
    user_rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    statusAtencion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    tipoAtencion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    indicaciones_turno: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_turna: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    notificacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    id_atencion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fechaCierre: {
      type: DataTypes.DATEONLY,
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
    }
  }, {
    sequelize,
    tableName: 'registro_atencions',
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
      {
        name: "registro_atencions_registro_id_foreign",
        using: "BTREE",
        fields: [
          { name: "registro_id" },
        ]
      },
    ]
  });
  }
}
