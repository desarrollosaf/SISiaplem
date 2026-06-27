import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TiposUsuariosAttributes {
  id: number;
  tipo: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TiposUsuariosPk = "id";
export type TiposUsuariosId = TiposUsuarios[TiposUsuariosPk];
export type TiposUsuariosOptionalAttributes = "id" | "created_at" | "updated_at";
export type TiposUsuariosCreationAttributes = Optional<TiposUsuariosAttributes, TiposUsuariosOptionalAttributes>;

export class TiposUsuarios extends Model<TiposUsuariosAttributes, TiposUsuariosCreationAttributes> implements TiposUsuariosAttributes {
  id!: number;
  tipo!: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TiposUsuarios {
    return TiposUsuarios.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'tipos_usuarios',
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
