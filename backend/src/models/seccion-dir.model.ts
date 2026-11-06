import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SeccionModel } from './seccion.model';

@Table({
  tableName: 'secciones_dir',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class SeccionDirModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;
  
  @ForeignKey(() => SeccionModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_seccion: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_Departamento: number;

  @BelongsTo(() => SeccionModel)
  declare seccionP: SeccionModel;

}
