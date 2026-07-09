import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tipo_tramite_movimientos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})


export class TipoTramiteMovModel extends Model {
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.BIGINT.UNSIGNED })
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: true })
    declare tipo: string;
}
