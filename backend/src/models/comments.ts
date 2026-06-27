import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Answers, AnswersId } from './answers';
import type { Registro, RegistroId } from './registro';

export interface CommentsAttributes {
  id: number;
  reg_id?: number;
  user_rfc: string;
  comment?: string;
  comment_to?: string;
  file_path?: string;
  status?: string;
  notificacion: number;
  created_at?: Date;
  updated_at?: Date;
  uuid?: string;
  tipo_doc?: number;
}

export type CommentsPk = "id";
export type CommentsId = Comments[CommentsPk];
export type CommentsOptionalAttributes = "id" | "reg_id" | "comment" | "comment_to" | "file_path" | "status" | "notificacion" | "created_at" | "updated_at" | "uuid" | "tipo_doc";
export type CommentsCreationAttributes = Optional<CommentsAttributes, CommentsOptionalAttributes>;

export class Comments extends Model<CommentsAttributes, CommentsCreationAttributes> implements CommentsAttributes {
  id!: number;
  reg_id?: number;
  user_rfc!: string;
  comment?: string;
  comment_to?: string;
  file_path?: string;
  status?: string;
  notificacion!: number;
  created_at?: Date;
  updated_at?: Date;
  uuid?: string;
  tipo_doc?: number;

  // Comments hasMany Answers via id_comment
  answers!: Answers[];
  getAnswers!: Sequelize.HasManyGetAssociationsMixin<Answers>;
  setAnswers!: Sequelize.HasManySetAssociationsMixin<Answers, AnswersId>;
  addAnswer!: Sequelize.HasManyAddAssociationMixin<Answers, AnswersId>;
  addAnswers!: Sequelize.HasManyAddAssociationsMixin<Answers, AnswersId>;
  createAnswer!: Sequelize.HasManyCreateAssociationMixin<Answers>;
  removeAnswer!: Sequelize.HasManyRemoveAssociationMixin<Answers, AnswersId>;
  removeAnswers!: Sequelize.HasManyRemoveAssociationsMixin<Answers, AnswersId>;
  hasAnswer!: Sequelize.HasManyHasAssociationMixin<Answers, AnswersId>;
  hasAnswers!: Sequelize.HasManyHasAssociationsMixin<Answers, AnswersId>;
  countAnswers!: Sequelize.HasManyCountAssociationsMixin;
  // Comments belongsTo Registro via reg_id
  reg!: Registro;
  getReg!: Sequelize.BelongsToGetAssociationMixin<Registro>;
  setReg!: Sequelize.BelongsToSetAssociationMixin<Registro, RegistroId>;
  createReg!: Sequelize.BelongsToCreateAssociationMixin<Registro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Comments {
    return Comments.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    reg_id: {
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comment_to: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notificacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    uuid: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo_doc: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'comments',
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
        name: "comments_reg_id_foreign",
        using: "BTREE",
        fields: [
          { name: "reg_id" },
        ]
      },
    ]
  });
  }
}
