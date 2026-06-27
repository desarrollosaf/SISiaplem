import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Registro, RegistroId } from './registro';

export interface AgendasAttributes {
  id: number;
  registro_id?: number;
  title: string;
  descripcion: string;
  start: Date;
  end: Date;
  empieza: string;
  termina: string;
  hora?: string;
  color: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export type AgendasPk = "id";
export type AgendasId = Agendas[AgendasPk];
export type AgendasOptionalAttributes = "id" | "registro_id" | "hora" | "created_at" | "updated_at";
export type AgendasCreationAttributes = Optional<AgendasAttributes, AgendasOptionalAttributes>;

export class Agendas extends Model<AgendasAttributes, AgendasCreationAttributes> implements AgendasAttributes {
  id!: number;
  registro_id?: number;
  title!: string;
  descripcion!: string;
  start!: Date;
  end!: Date;
  empieza!: string;
  termina!: string;
  hora?: string;
  color!: string;
  status!: number;
  created_at?: Date;
  updated_at?: Date;

  // Agendas belongsTo Registro via registro_id
  registro!: Registro;
  getRegistro!: Sequelize.BelongsToGetAssociationMixin<Registro>;
  setRegistro!: Sequelize.BelongsToSetAssociationMixin<Registro, RegistroId>;
  createRegistro!: Sequelize.BelongsToCreateAssociationMixin<Registro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Agendas {
    return Agendas.init({
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    empieza: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    termina: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    hora: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'agendas',
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
        name: "agendas_registro_id_foreign",
        using: "BTREE",
        fields: [
          { name: "registro_id" },
        ]
      },
    ]
  });
  }
}
