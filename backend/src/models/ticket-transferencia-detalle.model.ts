import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TicketModel } from './ticket.model';
import { SolicitudTransferenciaModel } from './solicitud-transferencia.model';

@Table({ tableName: 'ticket_transferencia_detalle', timestamps: false })
export class TicketTransferenciaDetalleModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => TicketModel)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare id_ticket: number;

  @ForeignKey(() => SolicitudTransferenciaModel)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare id_solicitud_transferencia: number | null;

  @BelongsTo(() => TicketModel)
  declare ticket: TicketModel;

  @BelongsTo(() => SolicitudTransferenciaModel)
  declare solicitud: SolicitudTransferenciaModel;
}
