import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tipo_expediente_tratamientos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TipoExpedienteTratamientoModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare tipo: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
}
