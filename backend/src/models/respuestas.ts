import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RespuestasAttributes {
  id: number;
  respuesta: string;
  registro_id: string;
  usuario_registro: string;
  created_at?: Date;
  updated_at?: Date;
}

export type RespuestasPk = "id";
export type RespuestasId = Respuestas[RespuestasPk];
export type RespuestasOptionalAttributes = "id" | "created_at" | "updated_at";
export type RespuestasCreationAttributes = Optional<RespuestasAttributes, RespuestasOptionalAttributes>;

export class Respuestas extends Model<RespuestasAttributes, RespuestasCreationAttributes> implements RespuestasAttributes {
  id!: number;
  respuesta!: string;
  registro_id!: string;
  usuario_registro!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Respuestas {
    return Respuestas.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    respuesta: {
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
    tableName: 'respuestas',
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
