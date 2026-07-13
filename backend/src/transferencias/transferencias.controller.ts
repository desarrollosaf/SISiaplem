import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { TransferenciasService } from './transferencias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  // GET /api/transferencias/elegibles?rfc=XXXX
  @Get('elegibles')
  elegibles(@Query('rfc') rfc: string) {
    return this.transferenciasService.getElegibles(rfc ?? '');
  }

  // POST /api/transferencias
  @Post()
  crear(@Body() dto: { rfc: string; expedienteIds: number[] }) {
    return this.transferenciasService.crearSolicitud(dto.rfc, dto.expedienteIds);
  }

  // GET /api/transferencias/pendientes
  @Get('pendientes')
  pendientes() {
    return this.transferenciasService.getPendientes();
  }

  // GET /api/transferencias/mias?rfc=XXXX
  @Get('mias')
  misSolicitudes(@Query('rfc') rfc: string) {
    return this.transferenciasService.getMisSolicitudes(rfc ?? '');
  }

  // GET /api/transferencias/autorizadas
  @Get('autorizadas')
  autorizadas() {
    return this.transferenciasService.getAutorizadas();
  }

  // GET /api/transferencias/rechazadas
  @Get('rechazadas')
  rechazadas() {
    return this.transferenciasService.getRechazadas();
  }

  // GET /api/transferencias/recibidas
  @Get('recibidas')
  recibidas() {
    return this.transferenciasService.getRecibidas();
  }

  // GET /api/transferencias/expedientes-recibidos
  @Get('expedientes-recibidos')
  expedientesRecibidos() {
    return this.transferenciasService.getExpedientesRecibidos();
  }

  // GET /api/transferencias/:id
  @Get(':id')
  detalle(@Param('id', ParseIntPipe) id: number) {
    return this.transferenciasService.getDetalle(id);
  }

  // PATCH /api/transferencias/:id/autorizar
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('transferencias.revisar')
  @Patch(':id/autorizar')
  autorizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rfc: string; autoriza: boolean; motivo?: string },
  ) {
    return this.transferenciasService.autorizar(id, dto.rfc, dto.autoriza, dto.motivo);
  }

  // PATCH /api/transferencias/:id/recibir
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('transferencias.recibir')
  @Patch(':id/recibir')
  recibir(@Param('id', ParseIntPipe) id: number, @Body() dto: { rfc: string }) {
    return this.transferenciasService.recibir(id, dto.rfc);
  }

  // GET /api/transferencias/:id/acta?tipo=revision|transferencia
  @Get(':id/acta')
  async acta(
    @Param('id', ParseIntPipe) id: number,
    @Query('tipo') tipo: 'revision' | 'transferencia',
    @Res() res: Response,
  ) {
    const buffer = await this.transferenciasService.getActaPdf(id, tipo === 'transferencia' ? 'transferencia' : 'revision');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="Acta.pdf"' });
    res.send(buffer);
  }
}
