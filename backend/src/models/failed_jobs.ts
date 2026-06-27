import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface FailedJobsAttributes {
  id: number;
  uuid: string;
  connection: string;
  queue: string;
  payload: string;
  exception: string;
  failed_at: Date;
}

export type FailedJobsPk = "id";
export type FailedJobsId = FailedJobs[FailedJobsPk];
export type FailedJobsOptionalAttributes = "id" | "failed_at";
export type FailedJobsCreationAttributes = Optional<FailedJobsAttributes, FailedJobsOptionalAttributes>;

export class FailedJobs extends Model<FailedJobsAttributes, FailedJobsCreationAttributes> implements FailedJobsAttributes {
  id!: number;
  uuid!: string;
  connection!: string;
  queue!: string;
  payload!: string;
  exception!: string;
  failed_at!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof FailedJobs {
    return FailedJobs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "failed_jobs_uuid_unique"
    },
    connection: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    queue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    exception: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    failed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'failed_jobs',
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
        name: "failed_jobs_uuid_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uuid" },
        ]
      },
    ]
  });
  }
}
