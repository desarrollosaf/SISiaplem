import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ResponsablesArchivosAttributes {
  id: number;
  tipo_id?: number;
  rfc_responsable?: string;
  id_Departamento?: number;
  status?: number;
  email?: string;
  tel?: string;
  ext?: string;
  id_edificio?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ResponsablesArchivosPk = "id";
export type ResponsablesArchivosId = ResponsablesArchivos[ResponsablesArchivosPk];
export type ResponsablesArchivosOptionalAttributes = "id" | "tipo_id" | "rfc_responsable" | "id_Departamento" | "status" | "email" | "tel" | "ext" | "id_edificio" | "created_at" | "updated_at";
export type ResponsablesArchivosCreationAttributes = Optional<ResponsablesArchivosAttributes, ResponsablesArchivosOptionalAttributes>;

export class ResponsablesArchivos extends Model<ResponsablesArchivosAttributes, ResponsablesArchivosCreationAttributes> implements ResponsablesArchivosAttributes {
  id!: number;
  tipo_id?: number;
  rfc_responsable?: string;
  id_Departamento?: number;
  status?: number;
  email?: string;
  tel?: string;
  ext?: string;
  id_edificio?: number;
  created_at?: Date;
  updated_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ResponsablesArchivos {
    return ResponsablesArchivos.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rfc_responsable: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    id_Departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    tel: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ext: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    id_edificio: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'responsables_archivos',
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
