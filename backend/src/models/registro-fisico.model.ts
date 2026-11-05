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

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_recepcion: Date;  

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_documento: Date;  

  @Column({ type: DataType.STRING, allowNull: true })
  declare referencia_documento: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare fecha_limite_atencion: Date;  

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare tipo_atencion: number;
  
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare serie_id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare subserie_id: number;

  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare expediente_id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare titulo_doc: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare descripcion_doc: string;
  
  @Column({ type: DataType.STRING, allowNull: true })
  declare user_registro_rfc: string;
  
  @Column({ type: DataType.STRING, allowNull: true })
  declare remitente_rfc: string;
  
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare fojas: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare path: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
}
