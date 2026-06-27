import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface CacheLocksAttributes {
  key: string;
  owner: string;
  expiration: number;
}

export type CacheLocksPk = "key";
export type CacheLocksId = CacheLocks[CacheLocksPk];
export type CacheLocksCreationAttributes = CacheLocksAttributes;

export class CacheLocks extends Model<CacheLocksAttributes, CacheLocksCreationAttributes> implements CacheLocksAttributes {
  key!: string;
  owner!: string;
  expiration!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof CacheLocks {
    return CacheLocks.init({
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    owner: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiration: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'cache_locks',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "key" },
        ]
      },
    ]
  });
  }
}
