import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TicketModel } from './ticket.model';

@Table({ tableName: 'ticket_directorio_detalle', timestamps: false })
export class TicketDirectorioDetalleModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => TicketModel)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare id_ticket: number;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare subtipo: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare nombre_completo_entrante: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare cargo_puesto: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare correo_institucional: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare telefono_extension: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare ruta_oficio_designacion: string | null;

  @BelongsTo(() => TicketModel)
  declare ticket: TicketModel;
}
