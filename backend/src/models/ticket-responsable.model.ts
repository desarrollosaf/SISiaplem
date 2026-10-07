import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'ticket_responsables', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class TicketResponsableModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare tipo_procedimiento: string | null;

  @Column({ type: DataType.STRING(13), allowNull: false })
  declare rfc_responsable: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare nombre_responsable: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare activo: boolean;
}
