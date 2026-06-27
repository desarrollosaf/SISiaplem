import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface CacheAttributes {
  key: string;
  value: string;
  expiration: number;
}

export type CachePk = "key";
export type CacheId = Cache[CachePk];
export type CacheCreationAttributes = CacheAttributes;

export class Cache extends Model<CacheAttributes, CacheCreationAttributes> implements CacheAttributes {
  key!: string;
  value!: string;
  expiration!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof Cache {
    return Cache.init({
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiration: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'cache',
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
