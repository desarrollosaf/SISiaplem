import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SubfondoAttributes {
  id: number;
  id_Dependencia?: number;
  codigo?: string;
  subfondo?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type SubfondoPk = "id";
export type SubfondoId = Subfondo[SubfondoPk];
export type SubfondoOptionalAttributes = "id" | "id_Dependencia" | "codigo" | "subfondo" | "created_at" | "updated_at";
export type SubfondoCreationAttributes = Optional<SubfondoAttributes, SubfondoOptionalAttributes>;

export class Subfondo extends Model<SubfondoAttributes, SubfondoCreationAttributes> implements SubfondoAttributes {
  id!: number;
  id_Dependencia?: number;
  codigo?: string;
  subfondo?: string;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Subfondo {
    return Subfondo.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_Dependencia: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    subfondo: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'subfondo',
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
