import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PermissionModel } from './permission.model';

@Table({ tableName: 'model_has_permissions', timestamps: false })
export class ModelHasPermission extends Model {
  @ForeignKey(() => PermissionModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false, primaryKey: true })
  declare permission_id: number;

  @Column({ type: DataType.STRING(255), allowNull: false, primaryKey: true })
  declare model_type: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false, primaryKey: true })
  declare model_id: number;

  @BelongsTo(() => PermissionModel, 'permission_id')
  declare permission: PermissionModel;
}
