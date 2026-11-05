import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Res,
  Req,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  NotFoundException
} from '@nestjs/common';
import type { Response } from 'express';
import { GuiaService } from './guia.service';
import { use } from 'passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage  } from 'multer';
import { extname, join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { SUsuario } from 'src/models/s-usuario.model';
import { TDepartamento } from 'src/models/t-departamento.model';


@Controller('guia')
export class GuiaController {
  constructor(private readonly guiaService: GuiaService) {}

  // GET /api/guia/inventario?rfc=XXXX
  @Get('inventario')
  inventario(@Query('rfc') rfc: string) {
    return this.guiaService.getInventario(rfc ?? '');
  }

  // GET /api/guia/guia-simple/pdf?rfc=XXXX
  @Get('guia-simple/pdf')
  async guiaSimplePdf(@Query('rfc') rfc: string, @Res() res: Response) {
    const buffer = await this.guiaService.getGuiaSimplePdf(rfc ?? '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="GuiaSimpleDeArchivos.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/guia/inventario-general/pdf?rfc=XXXX
  @Get('inventario-general/pdf')
  async inventarioGeneralPdf(@Query('rfc') rfc: string, @Res() res: Response) {
    const buffer = await this.guiaService.getInventarioGeneralPdf(rfc ?? '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="InventarioGeneralDeArchivoDeTramite.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/guia/relacion-baja/pdf?rfc=XXXX
  @Get('relacion-baja/pdf')
  async relacionBajaPdf(@Query('rfc') rfc: string, @Res() res: Response) {
    const buffer = await this.guiaService.getRelacionBajaPdf(rfc ?? '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="RelacionDeDocumentosDesincorporados.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/guia/serie/:id
  @Get('serie/:id')
  getSerie(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.getSerie(id);
  }

  // GET /api/guia/subserie/:id
  @Get('subserie/:id')
  getSubserie(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.getSubserie(id);
  }

  // GET /api/guia/expedientes/serie/:id
  @Get('expedientes/serie/:id')
  expedientesSerie(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.getExpedientesSerie(id);
  }

  // GET /api/guia/expedientes/subserie/:id
  @Get('expedientes/subserie/:id')
  expedientesSubserie(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.getExpedientesSubserie(id);
  }

  // GET /api/guia/activos?rfc=XXXX
  @Get('activos')
  activos(@Query('rfc') rfc: string) {
    return this.guiaService.getActivos(rfc ?? '');
  }

  // GET /api/guia/cerrados?rfc=XXXX
  @Get('cerrados')
  cerrados(@Query('rfc') rfc: string) {
    return this.guiaService.getCerrados(rfc ?? '');
  }

  // GET /api/guia/listos-para-transferir?rfc=XXXX
  @Get('listos-para-transferir')
  listosParaTransferir(@Query('rfc') rfc: string) {
    return this.guiaService.getListosParaTransferir(rfc ?? '');
  }

  // GET /api/guia/actividad-reciente?rfc=XXXX&limit=5
  @Get('actividad-reciente')
  actividadReciente(@Query('rfc') rfc: string, @Query('limit') limit?: string) {
    return this.guiaService.getActividadReciente(
      rfc ?? '',
      limit ? parseInt(limit, 10) : 5,
    );
  }

  // POST /api/guia/expedientes
  @Post('expedientes')
  crearExpediente(
    @Body()
    dto: {
      id_serie?: number;
      id_subserie?: number;
      nombre_ex: string;
      anio: string;
      id_tipo_expediente?: number;
      rfc_usuario_expediente?: string;
    },
  ) {
    return this.guiaService.crearExpediente(dto);
  }

  // PATCH /api/guia/expedientes/:id/cerrar
  @Patch('expedientes/:id/cerrar')
  cerrarExpediente(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.cerrarExpediente(id);
  }

  // GET /api/guia/tipos-tratamiento
  @Get('tipos-tratamiento')
  tiposTratamiento() {
    return this.guiaService.getTiposTratamiento();
  }

  // GET /api/guia/servidores-publicos
  @Get('servidores-publicos')
  servidoresPublicos() {
    return this.guiaService.getServidoresPublicos();
  }

  // GET /api/guia/expedientes/:id — GuiaController.verExpediente()
  @Get('expedientes/:id')
  expedienteDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.getExpedienteDetalle(id);
  }

  // PUT /api/guia/expedientes/:id — GuiaController.transferirExp()/updateExp()
  @Put('expedientes/:id')
  transferirExpediente(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      nombre_ex?: string;
      anio?: string;
      id_tipo_expediente?: number | null;
      rfc_usuario_expediente?: string | null;
    },
  ) {
    return this.guiaService.transferirExpediente(id, dto);
  }

//guardar expediente fisico
@Put('addDocFisico/:id')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('path', {
    storage: memoryStorage(),
  }),
)
  async addDocFisico(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @UploadedFile() archivo: Express.Multer.File,
    @Body()
    data: {
      folio?: string | null;
      fecha_recepcion?: string | null;
      fecha_documento?: string | null;
      referencia_documento?: string | null;
      fecha_limite_atencion?: string | null;
      tipo_atencion: number | null;
      fojas?: string | null;
      remitente_rfc?: string | null; 
      titulo_doc?: string | null;
      descripcion_doc?: string | null;
      path?: string | null;
    },
  ) {
    const rfc = req.user.rfc;
      // Obtener clave del departamento
    const clave = await this.obtenerClaveDepartamento(rfc);
    // Crear carpeta dinámica
    const carpeta = `./documentacion/oficios/${clave}/`;

    mkdirSync(carpeta, { recursive: true });

    // Generar nombre del archivo
    const nombre = `${Date.now()}${extname(archivo.originalname)}`;
    // Guardar archivo
    const rutaArchivo = join(carpeta, nombre);
    writeFileSync(rutaArchivo, archivo.buffer);

    return this.guiaService.addDocFisico(id, { ...data, path: rutaArchivo}, rfc, { ...archivo, path: rutaArchivo,},);
  }

  // GET /api/guia/documento/:id — GuiaController.getDoc()
  @Get('documento/:id')
  async getDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const ruta = await this.guiaService.getRutaDocumento(id);
    res.sendFile(ruta);
  }

  
  // GET /api/guia/documento/:id — GuiaController.getDoc()
  @Get('documentoFisico/:id')
  async getDocumentoFisico(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const ruta = await this.guiaService.getRutaDocumentoFisico(id);
    res.sendFile(ruta);
  }

  // GET /api/guia/documento-registro/:id — GuiaController.getDocR()
  @Get('documento-registro/:id')
  async getDocumentoRegistro(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const ruta = await this.guiaService.getRutaDocumentoRegistro(id);
    res.sendFile(ruta);
  }

  // GET /api/guia/documento-envio/:id — descarga de documento anidado (documentos_envios)
  @Get('documento-envio/:id')
  async getDocumentoEnvio(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const ruta = await this.guiaService.getRutaDocumentoEnvio(id);
    res.sendFile(ruta);
  }

  // GET /api/guia/expedientes/:id/indice/fisico — GuiaController.getIndexExpF()
  @Get('expedientes/:id/indice/fisico')
  async indiceFisico(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.guiaService.getIndicePdf(id, 'fisico');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Index.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/guia/expedientes/:id/indice/electronico — GuiaController.getIndexExpE()
  @Get('expedientes/:id/indice/electronico')
  async indiceElectronico(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.guiaService.getIndicePdf(id, 'electronico');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Index.pdf"',
    });
    res.send(buffer);
  }

  
  private async obtenerClaveDepartamento(rfc: string): Promise<string> {
  const usuario = await SUsuario.findOne({
    where: {
      N_Usuario: rfc,
    },
    include: [
      {
        model: TDepartamento,
      },
    ],
  });

  if (!usuario){
    throw new NotFoundException('Usuario no encontrado');
  }

  return String(usuario.departamentoM?.c_presup);
  }

  @Get('buscarDocumentos')
    buscarDocumentos(
      @Query('q') q: string,
    ) {
      return this.guiaService.buscarDocumentos(q);
  }
}
