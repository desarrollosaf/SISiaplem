import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SeccionService } from './seccion.service';

@Controller('seccion')
export class SeccionController {
  constructor(private readonly seccionService: SeccionService) {}

  // ── Catálogo (rutas nombradas ANTES de :id) ───────────────────────────────

  // GET /api/seccion/tipo-secciones
  @Get('tipo-secciones')
  getTipoSecciones() {
    return this.seccionService.getTipoSecciones();
  }

  // GET /api/seccion/direcciones/:subfondoId
  @Get('direcciones/:subfondoId')
  getDirecciones(@Param('subfondoId', ParseIntPipe) subfondoId: number) {
    return this.seccionService.getDirecciones(subfondoId);
  }

  // ── Secciones ─────────────────────────────────────────────────────────────

  // GET /api/seccion/subfondo/:subfondoId
  @Get('subfondo/:subfondoId')
  getBySub(@Param('subfondoId', ParseIntPipe) subfondoId: number) {
    return this.seccionService.getBySub(subfondoId);
  }

  // GET /api/seccion/:id  (con series+subseries anidadas)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.findOne(id);
  }

  // POST /api/seccion
  @Post()
  create(
    @Body()
    dto: {
      id_subfondo: number;
      codigo: string;
      seccion: string;
      id_tipo_seccion: number;
      direccion_ids?: number[];
    },
  ) {
    return this.seccionService.create(dto);
  }

  // PUT /api/seccion/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      codigo: string;
      seccion: string;
      id_tipo_seccion: number;
      direccion_ids?: number[];
    },
  ) {
    return this.seccionService.update(id, dto);
  }

  // PATCH /api/seccion/:id/toggle
  @Patch(':id/toggle')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.toggleStatus(id);
  }

  // DELETE /api/seccion/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.remove(id);
  }

  // ── Series ────────────────────────────────────────────────────────────────

  // POST /api/seccion/serie
  @Post('serie')
  createSerie(
    @Body()
    dto: {
      idSeccion: number;
      codigo: string;
      serie: string;
      departamento_id?: number | null;
    },
  ) {
    return this.seccionService.createSerie(dto);
  }

  // PUT /api/seccion/serie/:id
  @Put('serie/:id')
  updateSerie(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { codigo: string; serie: string; departamento_id?: number | null },
  ) {
    return this.seccionService.updateSerie(id, dto);
  }

  // PATCH /api/seccion/serie/:id/toggle
  @Patch('serie/:id/toggle')
  toggleSerie(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.toggleSerie(id);
  }

  // DELETE /api/seccion/serie/:id
  @Delete('serie/:id')
  removeSerie(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.removeSerie(id);
  }

  // ── Subseries ─────────────────────────────────────────────────────────────

  // POST /api/seccion/subserie
  @Post('subserie')
  createSubserie(
    @Body()
    dto: {
      idSerie: number;
      codigo: string;
      subserie: string;
      id_Departamento?: number | null;
    },
  ) {
    return this.seccionService.createSubserie(dto);
  }

  // PUT /api/seccion/subserie/:id
  @Put('subserie/:id')
  updateSubserie(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: { codigo: string; subserie: string; id_Departamento?: number | null },
  ) {
    return this.seccionService.updateSubserie(id, dto);
  }

  // PATCH /api/seccion/subserie/:id/toggle
  @Patch('subserie/:id/toggle')
  toggleSubserie(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.toggleSubserie(id);
  }

  // DELETE /api/seccion/subserie/:id
  @Delete('subserie/:id')
  removeSubserie(@Param('id', ParseIntPipe) id: number) {
    return this.seccionService.removeSubserie(id);
  }
}
