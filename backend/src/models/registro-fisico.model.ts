import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'registro_fisicos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RegistroFisicoModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare folio: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare titulo_doc: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare expediente_id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
}
