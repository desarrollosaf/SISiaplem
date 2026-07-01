import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tipo_doc_serie',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TipoDocSerieModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_serie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subserie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subsubserie: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_tipo_doc: number | null;
}
