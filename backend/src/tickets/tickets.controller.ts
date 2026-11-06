import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ── Administración de responsables (rutas nombradas ANTES de :id) ────────

  @Get('responsables')
  listarResponsables() {
    return this.ticketsService.listarResponsables();
  }

  @Post('responsables')
  crearResponsable(@Body() dto: Parameters<TicketsService['crearResponsable']>[0]) {
    return this.ticketsService.crearResponsable(dto);
  }

  @Patch('responsables/:id')
  actualizarResponsable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Parameters<TicketsService['actualizarResponsable']>[1],
  ) {
    return this.ticketsService.actualizarResponsable(id, dto);
  }

  @Patch('responsables/:id/toggle')
  toggleResponsable(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.toggleResponsable(id);
  }

  // ── Tickets ────────────────────────────────────────────────────────────

  @Post()
  crear(@Body() dto: Parameters<TicketsService['crear']>[0]) {
    return this.ticketsService.crear(dto);
  }

  @Get()
  listar(
    @Query('tipo_procedimiento') tipo_procedimiento?: string,
    @Query('estado') estado?: string,
    @Query('rfc_solicitante') rfc_solicitante?: string,
    @Query('rfc_usuario') rfc_usuario?: string,
    @Query('es_admin') es_admin?: string,
  ) {
    return this.ticketsService.listar({
      tipo_procedimiento,
      estado,
      rfc_solicitante,
      rfc_usuario,
      es_admin: es_admin === 'true',
    });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.obtener(id);
  }

  @Patch(':id/asignar')
  asignar(@Param('id', ParseIntPipe) id: number, @Body() dto: Parameters<TicketsService['asignar']>[1]) {
    return this.ticketsService.asignar(id, dto);
  }

  @Patch(':id/autorizar-titular')
  autorizarTitular(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Parameters<TicketsService['autorizarTitular']>[1],
  ) {
    return this.ticketsService.autorizarTitular(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: Parameters<TicketsService['cambiarEstado']>[1]) {
    return this.ticketsService.cambiarEstado(id, dto);
  }

  @Patch(':id/cerrar')
  cerrar(@Param('id', ParseIntPipe) id: number, @Body() dto: Parameters<TicketsService['cerrar']>[1]) {
    return this.ticketsService.cerrar(id, dto);
  }
}
