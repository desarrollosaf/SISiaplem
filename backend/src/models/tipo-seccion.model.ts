import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tipo_seccions',
  timestamps: false,
})
export class TipoSeccionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare valor: string;
}
