import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface MigrationsAttributes {
  id: number;
  migration: string;
  batch: number;
}

export type MigrationsPk = "id";
export type MigrationsId = Migrations[MigrationsPk];
export type MigrationsOptionalAttributes = "id";
export type MigrationsCreationAttributes = Optional<MigrationsAttributes, MigrationsOptionalAttributes>;

export class Migrations extends Model<MigrationsAttributes, MigrationsCreationAttributes> implements MigrationsAttributes {
  id!: number;
  migration!: string;
  batch!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof Migrations {
    return Migrations.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    migration: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'migrations',
    timestamps: false,
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
