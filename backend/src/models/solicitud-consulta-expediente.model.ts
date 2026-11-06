import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SolicitudConsultaModel } from './solicitud-consulta.model';
import { ExpedienteSerieSubseModel } from './expediente-serie-subse.model';

@Table({
  tableName: 'solicitud_consulta_expedientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class SolicitudConsultaExpedienteModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @ForeignKey(() => SolicitudConsultaModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare id_solicitud_consulta: number;

  @ForeignKey(() => ExpedienteSerieSubseModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare id_expediente: number;

  @BelongsTo(() => SolicitudConsultaModel)
  declare solicitud: SolicitudConsultaModel;

  @BelongsTo(() => ExpedienteSerieSubseModel)
  declare expediente: ExpedienteSerieSubseModel;
}
