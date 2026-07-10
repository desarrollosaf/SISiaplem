import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { SeccionModel } from './seccion.model';
import { SubSerieModel } from './sub-serie.model';
import { ValorDocumentalSerieSubserieModel } from './valor_documental_serie_subserie.model';
import { DestinoFinalModel } from './destino_final.model';

@Table({ tableName: 'series', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SerieModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => SeccionModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare idSeccion: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare serie: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare departamento_id: number | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anio_tramite: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anios_consentracion: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare total_anios: number;

  @ForeignKey(() => DestinoFinalModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_destino: number;


  @BelongsTo(() => SeccionModel)
  declare seccion: SeccionModel;

  @HasMany(() => SubSerieModel, { foreignKey: 'idSerie' })
  declare subSeries: SubSerieModel[];
  
  @HasMany(() => ValorDocumentalSerieSubserieModel, { foreignKey: 'id_serie' })
  declare valores: ValorDocumentalSerieSubserieModel[];

  @BelongsTo(() => DestinoFinalModel)
  declare destino: DestinoFinalModel;
}
