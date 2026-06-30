import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { SeccionEntity } from './seccion.entity';
import { SubSerieEntity } from './sub-serie.entity';

@Table({ tableName: 'series', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SerieEntity extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => SeccionEntity)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare idSeccion: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare serie: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @BelongsTo(() => SeccionEntity)
  declare seccion: SeccionEntity;

  @HasMany(() => SubSerieEntity, { foreignKey: 'idSerie' })
  declare subSeries: SubSerieEntity[];
}
