import { BelongsTo, Column, DataType, ForeignKey, Table, Model } from "sequelize-typescript";
import { SerieModel } from "./serie.model";
import { SubSerieModel } from "./sub-serie.model";
import { ValorDocumentalsModel } from "./valor_documentals.model";

@Table({ tableName: 'valor_documental_serie_subserie', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })

export class ValorDocumentalSerieSubserieModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;

  @ForeignKey(() => SerieModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_serie: number;

  @ForeignKey(() => SubSerieModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_subserie: number;

  @ForeignKey(() => ValorDocumentalsModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_valor: number;

  @BelongsTo(() => SerieModel)
  declare serie: SerieModel;

  @BelongsTo(() => SubSerieModel)
  declare subserie: SubSerieModel;

  @BelongsTo(() => ValorDocumentalsModel)
  declare valor: ValorDocumentalsModel;
}
