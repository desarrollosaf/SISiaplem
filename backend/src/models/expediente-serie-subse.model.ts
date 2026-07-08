import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SerieModel } from './serie.model';
import { SubSerieModel } from './sub-serie.model';
import { TipoExpedienteTratamientoModel } from './tipo-expediente-tratamiento.model';
import { SolicitudTransferenciaModel } from './solicitud-transferencia.model';

@Table({
  tableName: 'expediente_serie_subses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ExpedienteSerieSubseModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @ForeignKey(() => SerieModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_serie: number | null;

  @ForeignKey(() => SubSerieModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subserie: number | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare nombre_ex: string;

  @Column({ type: DataType.STRING(4), allowNull: true })
  declare anio: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_cierre_exp: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;

  @ForeignKey(() => TipoExpedienteTratamientoModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_tipo_expediente: number | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare rfc_usuario_expediente: string | null;

  @ForeignKey(() => SolicitudTransferenciaModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_solicitud_transferencia: number | null;

  @BelongsTo(() => SerieModel)
  declare serie: SerieModel;

  @BelongsTo(() => SubSerieModel)
  declare subSerie: SubSerieModel;

  @BelongsTo(() => TipoExpedienteTratamientoModel)
  declare tipoExpediente: TipoExpedienteTratamientoModel;

  @BelongsTo(() => SolicitudTransferenciaModel)
  declare solicitudTransferencia: SolicitudTransferenciaModel;
}
