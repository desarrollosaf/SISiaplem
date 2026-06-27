import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Agendas, AgendasId } from './agendas';
import type { Comments, CommentsId } from './comments';
import type { RegistroAtencions, RegistroAtencionsId } from './registro_atencions';
import type { RegistroConocimientos, RegistroConocimientosId } from './registro_conocimientos';

export interface RegistroAttributes {
  id: number;
  folio: string;
  folio_rastreo?: number;
  fecha_recepcion?: string;
  fecha_documento?: string;
  referencia_documento?: string;
  fecha_limite_atencion: string;
  hora_atencion?: string;
  tipo_atencion: number;
  serie_id: number;
  subserie_id?: number;
  titulo_doc: string;
  descripcion_doc: string;
  path?: string;
  user_registro: number;
  remitente_rfc: string;
  otro_remitente?: string;
  otraSerie?: string;
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
  firmado?: number;
  tipo_doc?: number;
  status_envio?: number;
  rfc_autorizado?: string;
  rfc_vobo?: string;
  expediente_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type RegistroPk = "id";
export type RegistroId = Registro[RegistroPk];
export type RegistroOptionalAttributes = "id" | "folio_rastreo" | "fecha_recepcion" | "fecha_documento" | "referencia_documento" | "hora_atencion" | "subserie_id" | "path" | "otro_remitente" | "otraSerie" | "nombre_remitente" | "app_remitente" | "apm_remitente" | "depend_remitente" | "cargo_remitente" | "tel_remitente" | "fojas" | "status" | "activo" | "uuid" | "firmado" | "tipo_doc" | "status_envio" | "rfc_autorizado" | "rfc_vobo" | "expediente_id" | "created_at" | "updated_at";
export type RegistroCreationAttributes = Optional<RegistroAttributes, RegistroOptionalAttributes>;

export class Registro extends Model<RegistroAttributes, RegistroCreationAttributes> implements RegistroAttributes {
  id!: number;
  folio!: string;
  folio_rastreo?: number;
  fecha_recepcion?: string;
  fecha_documento?: string;
  referencia_documento?: string;
  fecha_limite_atencion!: string;
  hora_atencion?: string;
  tipo_atencion!: number;
  serie_id!: number;
  subserie_id?: number;
  titulo_doc!: string;
  descripcion_doc!: string;
  path?: string;
  user_registro!: number;
  remitente_rfc!: string;
  otro_remitente?: string;
  otraSerie?: string;
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
  firmado?: number;
  tipo_doc?: number;
  status_envio?: number;
  rfc_autorizado?: string;
  rfc_vobo?: string;
  expediente_id?: number;
  created_at?: Date;
  updated_at?: Date;

  // Registro hasMany Agendas via registro_id
  agendas!: Agendas[];
  getAgendas!: Sequelize.HasManyGetAssociationsMixin<Agendas>;
  setAgendas!: Sequelize.HasManySetAssociationsMixin<Agendas, AgendasId>;
  addAgenda!: Sequelize.HasManyAddAssociationMixin<Agendas, AgendasId>;
  addAgendas!: Sequelize.HasManyAddAssociationsMixin<Agendas, AgendasId>;
  createAgenda!: Sequelize.HasManyCreateAssociationMixin<Agendas>;
  removeAgenda!: Sequelize.HasManyRemoveAssociationMixin<Agendas, AgendasId>;
  removeAgendas!: Sequelize.HasManyRemoveAssociationsMixin<Agendas, AgendasId>;
  hasAgenda!: Sequelize.HasManyHasAssociationMixin<Agendas, AgendasId>;
  hasAgendas!: Sequelize.HasManyHasAssociationsMixin<Agendas, AgendasId>;
  countAgendas!: Sequelize.HasManyCountAssociationsMixin;
  // Registro hasMany Comments via reg_id
  comments!: Comments[];
  getComments!: Sequelize.HasManyGetAssociationsMixin<Comments>;
  setComments!: Sequelize.HasManySetAssociationsMixin<Comments, CommentsId>;
  addComment!: Sequelize.HasManyAddAssociationMixin<Comments, CommentsId>;
  addComments!: Sequelize.HasManyAddAssociationsMixin<Comments, CommentsId>;
  createComment!: Sequelize.HasManyCreateAssociationMixin<Comments>;
  removeComment!: Sequelize.HasManyRemoveAssociationMixin<Comments, CommentsId>;
  removeComments!: Sequelize.HasManyRemoveAssociationsMixin<Comments, CommentsId>;
  hasComment!: Sequelize.HasManyHasAssociationMixin<Comments, CommentsId>;
  hasComments!: Sequelize.HasManyHasAssociationsMixin<Comments, CommentsId>;
  countComments!: Sequelize.HasManyCountAssociationsMixin;
  // Registro hasMany RegistroAtencions via registro_id
  registro_atencions!: RegistroAtencions[];
  getRegistro_atencions!: Sequelize.HasManyGetAssociationsMixin<RegistroAtencions>;
  setRegistro_atencions!: Sequelize.HasManySetAssociationsMixin<RegistroAtencions, RegistroAtencionsId>;
  addRegistro_atencion!: Sequelize.HasManyAddAssociationMixin<RegistroAtencions, RegistroAtencionsId>;
  addRegistro_atencions!: Sequelize.HasManyAddAssociationsMixin<RegistroAtencions, RegistroAtencionsId>;
  createRegistro_atencion!: Sequelize.HasManyCreateAssociationMixin<RegistroAtencions>;
  removeRegistro_atencion!: Sequelize.HasManyRemoveAssociationMixin<RegistroAtencions, RegistroAtencionsId>;
  removeRegistro_atencions!: Sequelize.HasManyRemoveAssociationsMixin<RegistroAtencions, RegistroAtencionsId>;
  hasRegistro_atencion!: Sequelize.HasManyHasAssociationMixin<RegistroAtencions, RegistroAtencionsId>;
  hasRegistro_atencions!: Sequelize.HasManyHasAssociationsMixin<RegistroAtencions, RegistroAtencionsId>;
  countRegistro_atencions!: Sequelize.HasManyCountAssociationsMixin;
  // Registro hasMany RegistroConocimientos via registro_id
  registro_conocimientos!: RegistroConocimientos[];
  getRegistro_conocimientos!: Sequelize.HasManyGetAssociationsMixin<RegistroConocimientos>;
  setRegistro_conocimientos!: Sequelize.HasManySetAssociationsMixin<RegistroConocimientos, RegistroConocimientosId>;
  addRegistro_conocimiento!: Sequelize.HasManyAddAssociationMixin<RegistroConocimientos, RegistroConocimientosId>;
  addRegistro_conocimientos!: Sequelize.HasManyAddAssociationsMixin<RegistroConocimientos, RegistroConocimientosId>;
  createRegistro_conocimiento!: Sequelize.HasManyCreateAssociationMixin<RegistroConocimientos>;
  removeRegistro_conocimiento!: Sequelize.HasManyRemoveAssociationMixin<RegistroConocimientos, RegistroConocimientosId>;
  removeRegistro_conocimientos!: Sequelize.HasManyRemoveAssociationsMixin<RegistroConocimientos, RegistroConocimientosId>;
  hasRegistro_conocimiento!: Sequelize.HasManyHasAssociationMixin<RegistroConocimientos, RegistroConocimientosId>;
  hasRegistro_conocimientos!: Sequelize.HasManyHasAssociationsMixin<RegistroConocimientos, RegistroConocimientosId>;
  countRegistro_conocimientos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Registro {
    return Registro.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    folio_rastreo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_recepcion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_documento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    referencia_documento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_limite_atencion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_atencion: {
      type: DataTypes.TIME,
      allowNull: true
    },
    tipo_atencion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serie_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subserie_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    titulo_doc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion_doc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_registro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remitente_rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    otro_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    otraSerie: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    nombre_remitente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    app_remitente: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    apm_remitente: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    depend_remitente: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cargo_remitente: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tel_remitente: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.STRING(100),
      allowNull: true
    },
    firmado: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipo_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_envio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    rfc_autorizado: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    rfc_vobo: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    expediente_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registro',
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
