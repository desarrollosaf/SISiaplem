import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Registro, RegistroId } from './registro';

export interface RegistroConocimientosAttributes {
  id: number;
  registro_id: number;
  user_rfc: string;
  visto: number;
  created_at?: Date;
  updated_at?: Date;
}

export type RegistroConocimientosPk = "id";
export type RegistroConocimientosId = RegistroConocimientos[RegistroConocimientosPk];
export type RegistroConocimientosOptionalAttributes = "id" | "visto" | "created_at" | "updated_at";
export type RegistroConocimientosCreationAttributes = Optional<RegistroConocimientosAttributes, RegistroConocimientosOptionalAttributes>;

export class RegistroConocimientos extends Model<RegistroConocimientosAttributes, RegistroConocimientosCreationAttributes> implements RegistroConocimientosAttributes {
  id!: number;
  registro_id!: number;
  user_rfc!: string;
  visto!: number;
  created_at?: Date;
  updated_at?: Date;

  // RegistroConocimientos belongsTo Registro via registro_id
  registro!: Registro;
  getRegistro!: Sequelize.BelongsToGetAssociationMixin<Registro>;
  setRegistro!: Sequelize.BelongsToSetAssociationMixin<Registro, RegistroId>;
  createRegistro!: Sequelize.BelongsToCreateAssociationMixin<Registro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof RegistroConocimientos {
    return RegistroConocimientos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    registro_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'registro',
        key: 'id'
      }
    },
    user_rfc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'registro_conocimientos',
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
        name: "registro_conocimientos_registro_id_foreign",
        using: "BTREE",
        fields: [
          { name: "registro_id" },
        ]
      },
    ]
  });
  }
}
