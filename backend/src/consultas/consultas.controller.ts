import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('consultas')
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  // GET /api/consultas/elegibles?rfc=XXXX
  @Get('elegibles')
  elegibles(@Query('rfc') rfc: string) {
    return this.consultasService.getElegibles(rfc ?? '');
  }

  // POST /api/consultas
  @Post()
  crear(@Body() dto: { rfc: string; expedienteIds: number[] }) {
    return this.consultasService.crearSolicitud(dto.rfc, dto.expedienteIds);
  }

  // GET /api/consultas/pendientes
  @Get('pendientes')
  pendientes() {
    return this.consultasService.getPendientes();
  }

  // GET /api/consultas/mias?rfc=XXXX
  @Get('mias')
  misSolicitudes(@Query('rfc') rfc: string) {
    return this.consultasService.getMisSolicitudes(rfc ?? '');
  }

  // GET /api/consultas/autorizadas
  @Get('autorizadas')
  autorizadas() {
    return this.consultasService.getAutorizadas();
  }

  // GET /api/consultas/rechazadas
  @Get('rechazadas')
  rechazadas() {
    return this.consultasService.getRechazadas();
  }

  // GET /api/consultas/por-vencer?dias=7
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RAC')
  @Get('por-vencer')
  porVencer(@Query('dias') dias?: string) {
    return this.consultasService.getPorVencer(dias ? Number(dias) : 7);
  }

  // GET /api/consultas/:id
  @Get(':id')
  detalle(@Param('id', ParseIntPipe) id: number) {
    return this.consultasService.getDetalle(id);
  }

  // PATCH /api/consultas/:id/autorizar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RAC')
  @Patch(':id/autorizar')
  autorizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rfc: string; autoriza: boolean; motivo?: string; fechaLimite?: string },
  ) {
    return this.consultasService.autorizar(id, dto.rfc, dto.autoriza, dto.motivo, dto.fechaLimite);
  }
}
