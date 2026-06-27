import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface TipoDocsAttributes {
  id: number;
  tipo_doc?: string;
  duracion?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TipoDocsPk = "id";
export type TipoDocsId = TipoDocs[TipoDocsPk];
export type TipoDocsOptionalAttributes = "id" | "tipo_doc" | "duracion" | "status" | "created_at" | "updated_at";
export type TipoDocsCreationAttributes = Optional<TipoDocsAttributes, TipoDocsOptionalAttributes>;

export class TipoDocs extends Model<TipoDocsAttributes, TipoDocsCreationAttributes> implements TipoDocsAttributes {
  id!: number;
  tipo_doc?: string;
  duracion?: number;
  status?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof TipoDocs {
    return TipoDocs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo_doc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'tipo_docs',
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
