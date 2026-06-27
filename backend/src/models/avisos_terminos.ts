import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AvisosTerminosAttributes {
  id: number;
  rfc_usuario?: string;
  path_aviso?: string;
  path_terminos?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type AvisosTerminosPk = "id";
export type AvisosTerminosId = AvisosTerminos[AvisosTerminosPk];
export type AvisosTerminosOptionalAttributes = "id" | "rfc_usuario" | "path_aviso" | "path_terminos" | "created_at" | "updated_at" | "deleted_at";
export type AvisosTerminosCreationAttributes = Optional<AvisosTerminosAttributes, AvisosTerminosOptionalAttributes>;

export class AvisosTerminos extends Model<AvisosTerminosAttributes, AvisosTerminosCreationAttributes> implements AvisosTerminosAttributes {
  id!: number;
  rfc_usuario?: string;
  path_aviso?: string;
  path_terminos?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof AvisosTerminos {
    return AvisosTerminos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rfc_usuario: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    path_aviso: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    path_terminos: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'avisos_terminos',
    timestamps: true,
    paranoid: true,
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
