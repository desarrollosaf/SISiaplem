import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';


@Table({ tableName: 'destino_finals', timestamps: false })
export class DestinoFinalModel extends Model {
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
    declare id: number;

    @Column({ type: DataType.STRING(255), allowNull: false })
    declare valor: string;
}