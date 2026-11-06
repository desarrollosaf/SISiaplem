import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SeccionModel } from './seccion.model';
import { SerieModel } from './serie.model';
import { SubSerieModel } from './sub-serie.model';
import { TipoTramiteModel } from './tipo_tramite.model';
import { TipoTramiteMovModel } from './tipo_tramite_mov.model';
import { EstatusModel } from './estatus.model';

@Table({
  tableName: 'solicitud_clasificacions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class SolicitudClasificacionModel extends Model {
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
    declare id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare rfc_solicita: string;
  
  @ForeignKey(() => SeccionModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare idSeccion: number;
  
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_departamento: number;

  @ForeignKey(() => TipoTramiteModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare tipo: number;
  
  @ForeignKey(() => TipoTramiteMovModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare tipoMov: number;
  
  @Column({ type: DataType.STRING, allowNull: true })
  declare motivo: string;
  
  @Column({ type: DataType.STRING, allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare adicion: string;

  @ForeignKey(() => SerieModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_serie: number;

  @ForeignKey(() => SubSerieModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_subserie: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_subsubserie: number;

  @ForeignKey(() => EstatusModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false, defaultValue: 1 })
  declare status_solicitud: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare motivo_rechazo: string;

@BelongsTo(() => SeccionModel)
declare seccion: SeccionModel;

@BelongsTo(() => TipoTramiteModel)
declare tipoTramite: TipoTramiteModel;

@BelongsTo(() => TipoTramiteMovModel)
declare movimiento: TipoTramiteMovModel;

@BelongsTo(() => SerieModel)
declare serieM: SerieModel;

@BelongsTo(() => SubSerieModel)
declare suberieM: SubSerieModel;

@BelongsTo(() => EstatusModel)
declare statusSolicitud: EstatusModel;
}