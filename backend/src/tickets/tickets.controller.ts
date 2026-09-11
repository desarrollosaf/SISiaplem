import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  crear(@Body() dto: Parameters<TicketsService['crear']>[0]) {
    return this.ticketsService.crear(dto);
  }

  @Get()
  listar(
    @Query('tipo_procedimiento') tipo_procedimiento?: string,
    @Query('estado') estado?: string,
    @Query('rfc_solicitante') rfc_solicitante?: string,
  ) {
    return this.ticketsService.listar({ tipo_procedimiento, estado, rfc_solicitante });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.obtener(id);
  }

  @Patch(':id/asignar')
  asignar(@Param('id', ParseIntPipe) id: number, @Body() dto: Parameters<TicketsService['asignar']>[1]) {
    return this.ticketsService.asignar(id, dto);
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
