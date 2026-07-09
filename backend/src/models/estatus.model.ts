import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'estatuses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class EstatusModel extends Model{
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: true })
    declare status: string;
}
