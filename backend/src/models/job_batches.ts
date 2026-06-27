import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface JobBatchesAttributes {
  id: string;
  name: string;
  total_jobs: number;
  pending_jobs: number;
  failed_jobs: number;
  failed_job_ids: string;
  options?: string;
  cancelled_at?: number;
  created_at: number;
  finished_at?: number;
}

export type JobBatchesPk = "id";
export type JobBatchesId = JobBatches[JobBatchesPk];
export type JobBatchesOptionalAttributes = "options" | "cancelled_at" | "created_at" | "finished_at";
export type JobBatchesCreationAttributes = Optional<JobBatchesAttributes, JobBatchesOptionalAttributes>;

export class JobBatches extends Model<JobBatchesAttributes, JobBatchesCreationAttributes> implements JobBatchesAttributes {
  id!: string;
  name!: string;
  total_jobs!: number;
  pending_jobs!: number;
  failed_jobs!: number;
  failed_job_ids!: string;
  options?: string;
  cancelled_at?: number;
  created_at!: number;
  finished_at?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof JobBatches {
    return JobBatches.init({
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    total_jobs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pending_jobs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    failed_jobs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    failed_job_ids: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    finished_at: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'job_batches',
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
