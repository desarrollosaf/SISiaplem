import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ExpedienteSerieSubseModel } from './expediente-serie-subse.model';

@Table({
  tableName: 'solicitudes_transferencia',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class SolicitudTransferenciaModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_departamento: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare rfc_solicita: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare rfc_revisa: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fecha_revision: Date | null;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  declare autorizada: boolean | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare motivo_rechazo: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare rfc_recibe: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fecha_recepcion: Date | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'pendiente' })
  declare estado: 'pendiente' | 'rechazada' | 'autorizada' | 'recibida';

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare total_fojas: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare total_cajas: number | null;

  @HasMany(() => ExpedienteSerieSubseModel, { foreignKey: 'id_solicitud_transferencia' })
  declare expedientes: ExpedienteSerieSubseModel[];
}
