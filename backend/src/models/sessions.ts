import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface SessionsAttributes {
  id: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  payload: string;
  last_activity: number;
}

export type SessionsPk = "id";
export type SessionsId = Sessions[SessionsPk];
export type SessionsOptionalAttributes = "user_id" | "ip_address" | "user_agent";
export type SessionsCreationAttributes = Optional<SessionsAttributes, SessionsOptionalAttributes>;

export class Sessions extends Model<SessionsAttributes, SessionsCreationAttributes> implements SessionsAttributes {
  id!: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  payload!: string;
  last_activity!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof Sessions {
    return Sessions.init({
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    last_activity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'sessions',
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
      {
        name: "sessions_user_id_index",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "sessions_last_activity_index",
        using: "BTREE",
        fields: [
          { name: "last_activity" },
        ]
      },
    ]
  });
  }
}
