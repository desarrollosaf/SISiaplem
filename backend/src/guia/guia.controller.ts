import {
  Controller, Get, Post, Patch, Put, Param, Query, Body, ParseIntPipe, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GuiaService } from './guia.service';

@Controller('guia')
export class GuiaController {
  constructor(private readonly guiaService: GuiaService) {}

  // GET /api/guia/inventario?rfc=XXXX
  @Get('inventario')
  inventario(@Query('rfc') rfc: string) {
    return this.guiaService.getInventario(rfc ?? '');
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

  // POST /api/guia/expedientes
  @Post('expedientes')
  crearExpediente(
    @Body() dto: {
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
    @Body() dto: {
      nombre_ex?: string;
      anio?: string;
      id_tipo_expediente?: number | null;
      rfc_usuario_expediente?: string | null;
    },
  ) {
    return this.guiaService.transferirExpediente(id, dto);
  }

  // GET /api/guia/documento/:id — GuiaController.getDoc()
  @Get('documento/:id')
  async getDocumento(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const ruta = await this.guiaService.getRutaDocumento(id);
    res.sendFile(ruta);
  }

  // GET /api/guia/documento-registro/:id — GuiaController.getDocR()
  @Get('documento-registro/:id')
  async getDocumentoRegistro(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const ruta = await this.guiaService.getRutaDocumentoRegistro(id);
    res.sendFile(ruta);
  }

  // GET /api/guia/expedientes/:id/indice/fisico — GuiaController.getIndexExpF()
  @Get('expedientes/:id/indice/fisico')
  async indiceFisico(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.guiaService.getIndicePdf(id, 'fisico');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="Index.pdf"' });
    res.send(buffer);
  }

  // GET /api/guia/expedientes/:id/indice/electronico — GuiaController.getIndexExpE()
  @Get('expedientes/:id/indice/electronico')
  async indiceElectronico(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.guiaService.getIndicePdf(id, 'electronico');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="Index.pdf"' });
    res.send(buffer);
  }
}
