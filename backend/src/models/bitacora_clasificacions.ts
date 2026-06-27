import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface BitacoraClasificacionsAttributes {
  id: number;
  movimiento?: string;
  fecha_movimiento?: string;
  usuario_movimiento?: string;
  id_destino?: number;
  id_tecnica?: number;
  anios_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  id_serie?: number;
  id_subserie?: number;
  id_seccion?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type BitacoraClasificacionsPk = "id";
export type BitacoraClasificacionsId = BitacoraClasificacions[BitacoraClasificacionsPk];
export type BitacoraClasificacionsOptionalAttributes = "id" | "movimiento" | "fecha_movimiento" | "usuario_movimiento" | "id_destino" | "id_tecnica" | "anios_tramite" | "anios_consentracion" | "total_anios" | "id_serie" | "id_subserie" | "id_seccion" | "created_at" | "updated_at";
export type BitacoraClasificacionsCreationAttributes = Optional<BitacoraClasificacionsAttributes, BitacoraClasificacionsOptionalAttributes>;

export class BitacoraClasificacions extends Model<BitacoraClasificacionsAttributes, BitacoraClasificacionsCreationAttributes> implements BitacoraClasificacionsAttributes {
  id!: number;
  movimiento?: string;
  fecha_movimiento?: string;
  usuario_movimiento?: string;
  id_destino?: number;
  id_tecnica?: number;
  anios_tramite?: number;
  anios_consentracion?: number;
  total_anios?: number;
  id_serie?: number;
  id_subserie?: number;
  id_seccion?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof BitacoraClasificacions {
    return BitacoraClasificacions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    movimiento: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_movimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    usuario_movimiento: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    id_destino: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tecnica: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    anios_tramite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    anios_consentracion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_anios: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subserie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_seccion: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bitacora_clasificacions',
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
