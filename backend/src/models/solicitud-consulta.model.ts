import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SolicitudConsultaExpedienteModel } from './solicitud-consulta-expediente.model';

@Table({
  tableName: 'solicitudes_consulta',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class SolicitudConsultaModel extends Model {
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

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'pendiente' })
  declare estado: 'pendiente' | 'rechazada' | 'autorizada';

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_limite: string | null;

  @HasMany(() => SolicitudConsultaExpedienteModel, { foreignKey: 'id_solicitud_consulta' })
  declare expedientes: SolicitudConsultaExpedienteModel[];
}
