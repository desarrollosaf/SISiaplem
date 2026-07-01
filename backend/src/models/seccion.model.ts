import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { SubfondoModel } from './subfondo.model';
import { SerieModel } from './serie.model';

@Table({ tableName: 'secciones', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SeccionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare seccion: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_tipo_seccion: number;

  @ForeignKey(() => SubfondoModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subfondo: number;

  @BelongsTo(() => SubfondoModel)
  declare subfondoParent: SubfondoModel;

  @HasMany(() => SerieModel, { foreignKey: 'idSeccion' })
  declare series: SerieModel[];
}
