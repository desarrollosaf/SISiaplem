import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SubSerieModel } from './sub-serie.model';
import { DestinoFinalModel } from './destino_final.model';
import { TecnicaSeleccionModel } from './tecnica-seleccion.model';

@Table({
  tableName: 'subsub_series',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class SubsubSerieModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare subsubserie: string;

  @ForeignKey(() => SubSerieModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare idSubserie: number | null;

  @BelongsTo(() => SubSerieModel)
  declare subSerie: SubSerieModel;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare idSerie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_departamento: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare status: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anio_tramite: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anios_consentracion: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare total_anios: number | null;

  @ForeignKey(() => DestinoFinalModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_destino: number | null;

  @ForeignKey(() => TecnicaSeleccionModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_tecnica: number | null;

  @BelongsTo(() => DestinoFinalModel)
  declare destino: DestinoFinalModel;

  @BelongsTo(() => TecnicaSeleccionModel)
  declare tecnica: TecnicaSeleccionModel;
}
