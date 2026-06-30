import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SerieEntity } from './serie.entity';

@Table({ tableName: 'sub_series', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SubSerieEntity extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare subserie: string;

  @ForeignKey(() => SerieEntity)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare idSerie: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @BelongsTo(() => SerieEntity)
  declare serie: SerieEntity;
}
