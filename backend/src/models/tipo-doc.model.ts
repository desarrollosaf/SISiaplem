import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tipo_docs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TipoDocModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare tipo_doc: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;
}
