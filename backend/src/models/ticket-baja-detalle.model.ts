import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TicketModel } from './ticket.model';

@Table({ tableName: 'ticket_baja_detalle', timestamps: false })
export class TicketBajaDetalleModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => TicketModel)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare id_ticket: number;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare dictamen_procedencia: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare programacion_traslado: string | null;

  @BelongsTo(() => TicketModel)
  declare ticket: TicketModel;
}
