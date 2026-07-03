import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'responsables_archivos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ResponsableArchivoModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare tipo_id: number;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare rfc_responsable: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_Departamento: number;

  @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: true })
  declare status: boolean;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare email: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare tel: string;

  @Column({ type: DataType.STRING(4), allowNull: true })
  declare ext: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_edificio: number;
}
