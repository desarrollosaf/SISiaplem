import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { afterEach } from 'node:test';
import { Model, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { DestinoFinalModel } from 'src/models/destino_final.model';
import { SeccionModel } from 'src/models/seccion.model';
import { SerieModel } from 'src/models/serie.model';
import { SubSerieModel } from 'src/models/sub-serie.model';
import { ValorDocumentalSerieSubserieModel } from 'src/models/valor_documental_serie_subserie.model';
import { ValorDocumentals } from 'src/models/valor_documentals';
import { ValorDocumentalsModel } from 'src/models/valor_documentals.model';

@Injectable()
export class CadidoService {
constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}
    
  async getsubfondos() {
    const sub = await this.sequelize.query(
      `SELECT s.id, s.codigo, s.subfondo, d.nombre_completo FROM subfondo s INNER JOIN adminplem_saf.t_dependencia d
      ON d.id_Dependencia = s.id_dependencia`,
      { 
        type: QueryTypes.SELECT,
      },
    );
    return sub;
  }

  async getcadido(id: number){
    const seccion = await SeccionModel.findAll({
      where: {
        'id_subfondo': id, 
        'status': 1,
      },
      include: [
        {
          model: SerieModel,
          include:[
            {
              model: SubSerieModel, 
              where:{
                'status': 1,
              }, 
              include:[
                {
                  model: ValorDocumentalSerieSubserieModel, 
                  order: ['id_valor', 'asc']
                }, 
                {
                  model: DestinoFinalModel
                }
              ]
            },
            {
              model: ValorDocumentalSerieSubserieModel,
              order: ['id_valor', 'asc']
            }, 
            {
              model: DestinoFinalModel
            }
          ], 
          where:{
            'status': 1,
          }
        }, 
      ]
    });

    seccion.map((d) => ({
        id: d.id,
        codigoS: d.codigo,
        seccion: d.seccion, 
        series: (d.series ?? []).map((ser) => ({
          id: ser.id,
          codigo: ser.codigo,
          serie: ser.serie,
          at: ser.anio_tramite == null ? 0 : ser.anio_tramite,
          ac: ser.anios_consentracion ?? 0 ,
          total: ser.total_anios ?? 0,
          valores: (ser.valores ?? []).map((v) => ({
            id: v.id_valor,
          })),
          destino: ser.destino?.valor ?? null,
          id_destino: ser.id_destino,
          subseries: (ser.subSeries ?? []).map((sub) => ({
            id: sub.id,
            codigo: sub.codigo,
            subserie: sub.subserie,
            at: sub.anio_tramite ?? 0,
            ac: sub.anios_consentracion ?? 0,
            total: sub.total_anios ?? 0,
            valores: (sub.valores ?? []).map((v) => ({
              id: v.id_valor,
            })),
            destino: sub.destino?.valor ?? null,
          })),
        })),
      }));

    return seccion;
  }

  async getserie(id: number, tipo: number){
    let serie;
    if(tipo == 1){
      serie = await SerieModel.findOne({
          where: {
            id 
          },
          include: [
            {
              model: ValorDocumentalSerieSubserieModel,
            }, 
            {
              model: DestinoFinalModel
            }
          ],
        });
    }else{
        serie = await SubSerieModel.findOne({
        where: {
          id 
        },
        include: [
          {
            model: ValorDocumentalSerieSubserieModel,
          }, 
          {
            model: DestinoFinalModel
          }
        ],
      });
    } 
    
    const valores = await ValorDocumentalsModel.findAll();
    const destinos = await DestinoFinalModel.findAll();

    const response = {
      series:  serie,
      valoresS: valores,
      destinosS: destinos
    }
    return response;
  }

  async update( id: number,
    dto: {
      codigo: string;
      serie: string;
      anio_tramite: number;
      anios_consentracion: number;
      total_anios: number;
      id_destino: number;
      valoresSeleccionados: [], 
      tipo: number
    },
  ) {
    const { valoresSeleccionados, ...data } = dto;

    if(dto.tipo == 1){
      await SerieModel.update(data, { where: { id } });

    if (valoresSeleccionados !== undefined) {
      await ValorDocumentalSerieSubserieModel.destroy({ where: { id_serie: id } });
      if (valoresSeleccionados.length > 0) {
        await ValorDocumentalSerieSubserieModel.bulkCreate(
          valoresSeleccionados.map((id_valor) => ({
            id_serie: id,
            id_valor,
          })),
        );
      }
    }
    }else{
      await SubSerieModel.update(data, { where: { id } });

      if (valoresSeleccionados !== undefined) {
        await ValorDocumentalSerieSubserieModel.destroy({ where: { id_subserie: id } });
        if (valoresSeleccionados.length > 0) {
          await ValorDocumentalSerieSubserieModel.bulkCreate(
            valoresSeleccionados.map((id_valor) => ({
              id_subserie: id,
              id_valor,
            })),
          );
        }
      }
    }
  
    return { id, ...data };
  }
}
