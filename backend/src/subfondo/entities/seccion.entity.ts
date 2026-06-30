import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { SubfondoEntity } from './subfondo.entity';
import { SerieEntity } from './serie.entity';

@Table({ tableName: 'secciones', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class SeccionEntity extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare codigo: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare seccion: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare status: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_tipo_seccion: number;

  @ForeignKey(() => SubfondoEntity)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_subfondo: number;

  @BelongsTo(() => SubfondoEntity)
  declare subfondoParent: SubfondoEntity;

  @HasMany(() => SerieEntity, { foreignKey: 'idSeccion' })
  declare series: SerieEntity[];
}
