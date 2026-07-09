import { Injectable } from '@nestjs/common';
import { ResponsableArchivoModel } from 'src/models/responsable-archivo.model';
import { map } from 'rxjs';
import { SerieModel } from 'src/models/serie.model';
import { SubSerieModel } from 'src/models/sub-serie.model';
import { SolicitudClasificacionModel } from 'src/models/solicitud_clasificacion.model';
import { TipoTramiteMovModel } from 'src/models/tipo_tramite_mov.model';
import { TipoTramiteModel } from 'src/models/tipo_tramite.model';
import { EstatusModel } from 'src/models/estatus.model';
import { TDepartamento } from 'src/models/t-departamento.model';
import { SeccionModel } from 'src/models/seccion.model';
import { SeccionDirModel } from 'src/models/seccion-dir.model';
import { Model } from 'sequelize';

@Injectable()
export class ClasificacionService {
constructor(
  
  ) {}

  async findAll(rfc: string) {
    const deptos = await ResponsableArchivoModel.findAll({
      attributes: ['id_Departamento'],
      where:{
        rfc_responsable: rfc, 
        status: 1
      }
    }); 
  
    const idsDep = deptos.map(d => d.id_Departamento);
    const series = await SerieModel.findAll({
      where:{
        departamento_id: idsDep, 
        status: 1
      },
    })

    const subseries = await SubSerieModel.findAll({
      where:{
        id_Departamento: idsDep, 
        status: 1
      }
    });

    const response = {
      series: series,
      subseries: subseries
    }
    return response;
  }

  async getsolicitudes(rfc: string){
    const solicitud = await SolicitudClasificacionModel.findAll({
      where: {
        rfc_solicita: rfc,
        status: 1
      },
      include:[
        {
          model: TipoTramiteMovModel
        },
        {
          model: TipoTramiteModel
        }, 
        {
          model: SerieModel
        }, 
        {
          model: SubSerieModel
        }, {
          model: EstatusModel
        }, 
      ],
      order:[['created_at', 'DESC']],
    })

    solicitud.map((d) => ({
      id: d.id,
      solicitante: d.rfc_solicita,
      tipoTramite: d.tipoTramite.tipo,
      serie: d.serieM?.serie,
      subserie: d.suberieM?.subserie,
      motivo: d.motivo,
      fecha: d.createdAt,
      estatus: d.statusSolicitud.status
    }))
    return solicitud;
  }

  async getTipo(){
    const tipo = await TipoTramiteModel.findAll();
    return tipo;
  }

  async getDeptos(rfc: string){
    const responsable = await ResponsableArchivoModel.findAll({
      attributes: ['id_Departamento'],
      where:{
        rfc_responsable: rfc,
        status: 1
      }
    })
    const idsDep = responsable.map(d => d.id_Departamento);
    const deptos = await TDepartamento.findAll({
      where:{
        id_Departamento: idsDep
      }
    })
    return deptos;
  }

  async gettipotramitemov(){
    const tipo = await TipoTramiteMovModel.findAll();
  return tipo;
  }

  async getseccion(rfc: string){

    const responsable = await ResponsableArchivoModel.findAll({
      attributes: ['id_Departamento'],
      where:{
        rfc_responsable: rfc, 
        status: 1
      }
    })
    const idsDep = responsable.map(d => d.id_Departamento);
    const seccion = await SeccionModel.findAll({
      where:{
        departamento_id: idsDep, 
        status: 1
      }
    })

    const secciones = await SeccionDirModel.findAll({
       where:{
        id_Departamento: idsDep, 
        status: 1
      }, 
      include:[
        {
          model: SeccionModel
        }
      ]
    });
     const combo = [
      ...seccion?.map((d) => ({
        id: d.id,
        codigo: d.codigo, 
        seccion: d.seccion
      })), 
      ...secciones?.map((s) => ({
        id: s.seccionP?.id,
        codigo: s.seccionP?.codigo, 
        seccion: s.seccionP?.seccion
      }))
    ]
    return combo;
  }

  async getseries(rfc: string){
    const responsable = await ResponsableArchivoModel.findAll({
      attributes: ['id_Departamento'],
      where:{
        rfc_responsable: rfc, 
        status: 1
      }
    })
    const idsDep = responsable.map(d => d.id_Departamento);

    const series = await SerieModel.findAll({
      where:{
        departamento_id: idsDep, 
        status: 1
      }
    })

    return series;
  }

   async getsubseries(rfc: string){
    const responsable = await ResponsableArchivoModel.findAll({
      attributes: ['id_Departamento'],
      where:{
        rfc_responsable: rfc, 
        status: 1
      }
    })
    const idsDep = responsable.map(d => d.id_Departamento);

    const subseries = await SubSerieModel.findAll({
      where:{
        id_Departamento: idsDep, 
        status: 1
      }
    })

    return subseries;
  }

  async saveSolicitud(form: [], rfc: string){
    const datos = {
      ...form,
      rfc_solicita: rfc,
    }

  console.log('datos  ', datos);
  const solicitud = await SolicitudClasificacionModel.create(datos);

  return solicitud;
  }

  async getSolicitudesAdmin(){
    const solicitudes = await SolicitudClasificacionModel.findAll({
      include:[
        {
          model: SeccionModel
        }, 
        {
          model: TipoTramiteModel
        },
        {
          model: TipoTramiteMovModel
        }, 
        {
          model: SerieModel
        }, 
        {
          model: SubSerieModel
        }, 
        {
          model: EstatusModel
        }
      ],
      order:[['created_at', 'desc']]
    })
    return solicitudes
  }
}


