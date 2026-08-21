import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { SerieModel } from './serie.model';
import { ValorDocumentalSerieSubserieModel } from './valor_documental_serie_subserie.model';
import { DestinoFinalModel } from './destino_final.model';
import { SubsubSerieModel } from './subsub-serie.model';
import { TecnicaSeleccionModel } from './tecnica-seleccion.model';

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

  @BelongsTo(() => SerieModel)
  declare serie: SerieModel;

  @HasMany(() => ValorDocumentalSerieSubserieModel, { foreignKey: 'id_subserie' })
  declare valores: ValorDocumentalSerieSubserieModel[];

  @HasMany(() => SubsubSerieModel, { foreignKey: 'idSubserie' })
  declare subsubSeries: SubsubSerieModel[];

  @BelongsTo(() => DestinoFinalModel)
    declare destino: DestinoFinalModel;

  @BelongsTo(() => TecnicaSeleccionModel)
  declare tecnica: TecnicaSeleccionModel;
}
