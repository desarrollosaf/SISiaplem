import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TipoDocModel } from './tipo-doc.model';

@Table({
  tableName: 'registro_docs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class RegistroDocsModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare folio: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare titulo_doc: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare path_doc: string;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare expediente_id: number;

  @ForeignKey(() => TipoDocModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare tipo_doc: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;

  @BelongsTo(() => TipoDocModel)
  declare tipo: TipoDocModel;
}
