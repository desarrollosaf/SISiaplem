import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TicketModel } from './ticket.model';
import { SolicitudConsultaModel } from './solicitud-consulta.model';

@Table({ tableName: 'ticket_prestamo_detalle', timestamps: false })
export class TicketPrestamoDetalleModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => TicketModel)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare id_ticket: number;

  @ForeignKey(() => SolicitudConsultaModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_solicitud_consulta: number | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare tipo_solicitud: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare persona_habilitada: string | null;

  @BelongsTo(() => TicketModel)
  declare ticket: TicketModel;

  @BelongsTo(() => SolicitudConsultaModel)
  declare solicitud: SolicitudConsultaModel;
}
