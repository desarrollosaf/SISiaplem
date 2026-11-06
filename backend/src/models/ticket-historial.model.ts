import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TicketModel } from './ticket.model';

@Table({ tableName: 'ticket_historial', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class TicketHistorialModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => TicketModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_ticket: number;

  @Column({ type: DataType.STRING(13), allowNull: true })
  declare rfc_actor: string | null;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare rol_actor: string | null;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare accion: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare estado_resultante: string | null;

  @BelongsTo(() => TicketModel)
  declare ticket: TicketModel;
}
