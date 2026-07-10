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
import { SUsuario } from 'src/models/s-usuario.model';

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

  async getSolicitud(id: number){
    const solicitud = await SolicitudClasificacionModel.findOne({
      where:{
        id: id
      }, 
      include:[
        {
          model: TipoTramiteModel
        }, 
        {
          model: TipoTramiteMovModel
        }, 
        {
          model: SeccionModel
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
      ]
    })

    const responsable = await SUsuario.findOne({
      where:{
        N_Usuario: solicitud?.rfc_solicita
      }, 
      include:[
        {
          model: TDepartamento
        }
      ]
    })

    const respuesta = {
      solicitud: solicitud, 
      solicitante: responsable
    }

    return respuesta;
  }

  async getstatus(){
    const status = EstatusModel.findAll();
    return status;
  }

  async editSolicitud(form){
    const solicitud = await SolicitudClasificacionModel.findOne({
        where:{
          id: form.id
        }
    })
    let up;

    if(form.status == 4){
      up = {
        status_solicitud: form.status,
        motivo_rechazo: form.motivo_rechazo
      }
    }
    if(form.status == 1 || form.status == 2){
      up = {
        status_solicitud: form.status,
        motivo_rechazo: null
      }
    }

    if(form.status == 3){
      up = {
        status_solicitud: form.status,
        motivo_rechazo: null
      }
        if(solicitud?.tipo == 1 && solicitud?.tipoMov == 1){
          const serieAdd = {
            idSeccion: solicitud.idSeccion,
            codigo: solicitud.codigo,
            serie: solicitud.adicion,
            departamento_id: solicitud.id_departamento,
          }

          await SerieModel.create(serieAdd);
        }

        if(solicitud?.tipo == 1 && solicitud?.tipoMov == 2){
          const subAdd = {
            codigo: solicitud.codigo,
            subserie: solicitud.adicion,
            idSerie: solicitud.id_serie,
            id_Departamento: solicitud.id_departamento
          }
          await SubSerieModel.create(subAdd)
        }

         const baja = {
            status: 0
          }

        if(solicitud?.tipo == 2 && solicitud?.tipoMov == 1){
          const serie = await SerieModel.findOne({
            where:{
              id: solicitud.id_serie
            }
          })
          await serie?.update(baja);
        }

        if(solicitud?.tipo == 2 && solicitud?.tipoMov == 2){
          const subserie = await SubSerieModel.findOne({
            where:{
              id: solicitud.id_subserie
            }
          })
          await subserie?.update(baja);
        }
      }
      
    await solicitud?.update(up);
    return true;
  }
}


