import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SeccionEntity } from './seccion.entity';

@Table({ tableName: 'subfondo', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SubfondoEntity extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_Dependencia: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare subfondo: string;

  @HasMany(() => SeccionEntity, { foreignKey: 'id_subfondo' })
  declare secciones: SeccionEntity[];
}
