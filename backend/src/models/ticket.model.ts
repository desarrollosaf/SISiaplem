import { Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { TicketDirectorioDetalleModel } from './ticket-directorio-detalle.model';
import { TicketBajaDetalleModel } from './ticket-baja-detalle.model';
import { TicketTransferenciaDetalleModel } from './ticket-transferencia-detalle.model';
import { TicketPrestamoDetalleModel } from './ticket-prestamo-detalle.model';
import { TicketHistorialModel } from './ticket-historial.model';

@Table({ tableName: 'tickets', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class TicketModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(20), allowNull: false, unique: true })
  declare folio: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare tipo_procedimiento: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare asunto: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare categoria: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_dependencia: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_unidad_administrativa: number | null;

  @Column({ type: DataType.STRING(13), allowNull: true })
  declare rfc_solicitante: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare nombre_solicitante: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare correo_solicitante: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare extension_solicitante: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare numero_oficio_turno: string | null;

  @Column({ type: DataType.STRING(30), allowNull: false, defaultValue: 'nuevo' })
  declare estado: string;

  @Column({ type: DataType.STRING(13), allowNull: true })
  declare rfc_asignado: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fecha_programada: Date | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare modalidad_lugar: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare ruta_acta: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comentarios_cierre: string | null;

  @HasOne(() => TicketDirectorioDetalleModel, { foreignKey: 'id_ticket' })
  declare directorioDetalle: TicketDirectorioDetalleModel;

  @HasOne(() => TicketBajaDetalleModel, { foreignKey: 'id_ticket' })
  declare bajaDetalle: TicketBajaDetalleModel;

  @HasOne(() => TicketTransferenciaDetalleModel, { foreignKey: 'id_ticket' })
  declare transferenciaDetalle: TicketTransferenciaDetalleModel;

  @HasOne(() => TicketPrestamoDetalleModel, { foreignKey: 'id_ticket' })
  declare prestamoDetalle: TicketPrestamoDetalleModel;

  @HasMany(() => TicketHistorialModel, { foreignKey: 'id_ticket' })
  declare historial: TicketHistorialModel[];
}
