import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SeccionModel } from './seccion.model';

@Table({ tableName: 'subfondo', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SubfondoModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_Dependencia: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare subfondo: string;

  @HasMany(() => SeccionModel, { foreignKey: 'id_subfondo' })
  declare secciones: SeccionModel[];
}
