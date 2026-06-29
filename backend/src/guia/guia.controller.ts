import {
  Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe,
} from '@nestjs/common';
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
    },
  ) {
    return this.guiaService.crearExpediente(dto);
  }

  // PATCH /api/guia/expedientes/:id/cerrar
  @Patch('expedientes/:id/cerrar')
  cerrarExpediente(@Param('id', ParseIntPipe) id: number) {
    return this.guiaService.cerrarExpediente(id);
  }
}
