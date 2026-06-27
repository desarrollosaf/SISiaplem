import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface JobsAttributes {
  id: number;
  queue: string;
  payload: string;
  attempts: number;
  reserved_at?: number;
  available_at: number;
  created_at: number;
}

export type JobsPk = "id";
export type JobsId = Jobs[JobsPk];
export type JobsOptionalAttributes = "id" | "reserved_at" | "created_at";
export type JobsCreationAttributes = Optional<JobsAttributes, JobsOptionalAttributes>;

export class Jobs extends Model<JobsAttributes, JobsCreationAttributes> implements JobsAttributes {
  id!: number;
  queue!: string;
  payload!: string;
  attempts!: number;
  reserved_at?: number;
  available_at!: number;
  created_at!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof Jobs {
    return Jobs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    queue: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attempts: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    reserved_at: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    available_at: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'jobs',
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
        name: "jobs_queue_index",
        using: "BTREE",
        fields: [
          { name: "queue" },
        ]
      },
    ]
  });
  }
}
