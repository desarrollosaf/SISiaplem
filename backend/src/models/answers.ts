import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Comments, CommentsId } from './comments';

export interface AnswersAttributes {
  id: number;
  reg_id?: number;
  id_comment?: number;
  user_rfc: string;
  comment?: string;
  file_path?: string;
  status?: string;
  notificacion: number;
  created_at?: Date;
  updated_at?: Date;
}

export type AnswersPk = "id";
export type AnswersId = Answers[AnswersPk];
export type AnswersOptionalAttributes = "id" | "reg_id" | "id_comment" | "comment" | "file_path" | "status" | "notificacion" | "created_at" | "updated_at";
export type AnswersCreationAttributes = Optional<AnswersAttributes, AnswersOptionalAttributes>;

export class Answers extends Model<AnswersAttributes, AnswersCreationAttributes> implements AnswersAttributes {
  id!: number;
  reg_id?: number;
  id_comment?: number;
  user_rfc!: string;
  comment?: string;
  file_path?: string;
  status?: string;
  notificacion!: number;
  created_at?: Date;
  updated_at?: Date;

  // Answers belongsTo Comments via id_comment
  id_comment_comment!: Comments;
  getId_comment_comment!: Sequelize.BelongsToGetAssociationMixin<Comments>;
  setId_comment_comment!: Sequelize.BelongsToSetAssociationMixin<Comments, CommentsId>;
  createId_comment_comment!: Sequelize.BelongsToCreateAssociationMixin<Comments>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Answers {
    return Answers.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    reg_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    id_comment: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'comments',
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
    }
  }, {
    sequelize,
    tableName: 'answers',
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
        name: "answers_id_comment_foreign",
        using: "BTREE",
        fields: [
          { name: "id_comment" },
        ]
      },
    ]
  });
  }
}
