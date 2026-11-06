import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TipoDocModel } from './tipo-doc.model';

@Table({
  tableName: 'documentos_envios',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class DocumentosEnvioModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare registro_id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: true })
  declare status_doc: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare path: string;

  @ForeignKey(() => TipoDocModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare tipo_doc: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare expediente_id: number;

  @BelongsTo(() => TipoDocModel)
  declare tipo: TipoDocModel;
}
