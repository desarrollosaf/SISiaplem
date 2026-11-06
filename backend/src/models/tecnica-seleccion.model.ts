import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'tecnicas_seleccions', timestamps: false })
export class TecnicaSeleccionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare valor: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare status: number;
}
