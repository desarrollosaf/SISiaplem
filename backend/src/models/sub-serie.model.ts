import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SerieModel } from './serie.model';

@Table({ tableName: 'sub_series', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SubSerieModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare subserie: string;

  @ForeignKey(() => SerieModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare idSerie: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_Departamento: number | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @BelongsTo(() => SerieModel)
  declare serie: SerieModel;
}
