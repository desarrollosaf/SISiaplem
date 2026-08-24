import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'bitacora_clasificacions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class BitacoraClasificacionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare movimiento: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_movimiento: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare usuario_movimiento: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_destino: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_tecnica: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anios_tramite: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare anios_consentracion: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare total_anios: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_serie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subserie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_seccion: number | null;
}
