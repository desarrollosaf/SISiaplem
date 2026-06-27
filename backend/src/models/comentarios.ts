import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ComentariosAttributes {
  id: number;
  comentario: string;
  registro_id: string;
  usuario_registro: string;
  created_at?: Date;
  updated_at?: Date;
}

export type ComentariosPk = "id";
export type ComentariosId = Comentarios[ComentariosPk];
export type ComentariosOptionalAttributes = "id" | "created_at" | "updated_at";
export type ComentariosCreationAttributes = Optional<ComentariosAttributes, ComentariosOptionalAttributes>;

export class Comentarios extends Model<ComentariosAttributes, ComentariosCreationAttributes> implements ComentariosAttributes {
  id!: number;
  comentario!: string;
  registro_id!: string;
  usuario_registro!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Comentarios {
    return Comentarios.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    comentario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    registro_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    usuario_registro: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'comentarios',
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
