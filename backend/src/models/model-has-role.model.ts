import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { RoleModel } from './role.model';

@Table({ tableName: 'model_has_roles', timestamps: false })
export class ModelHasRole extends Model {
  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false, primaryKey: true })
  declare role_id: number;

  @Column({ type: DataType.STRING(255), allowNull: false, primaryKey: true })
  declare model_type: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false, primaryKey: true })
  declare model_id: number;

  @BelongsTo(() => RoleModel, 'role_id')
  declare role: RoleModel;
}
