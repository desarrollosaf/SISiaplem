import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'registro',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RegistroModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare folio: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare titulo_doc: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare descripcion_doc: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare path: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare expediente_id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
}
