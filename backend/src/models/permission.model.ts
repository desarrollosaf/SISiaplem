import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'permissions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class PermissionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare guard_name: string;
}
