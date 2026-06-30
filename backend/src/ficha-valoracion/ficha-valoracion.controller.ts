import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FichaValoracionService } from './ficha-valoracion.service';

@Controller('ficha-valoracion')
export class FichaValoracionController {
  constructor(
    private readonly fichaValoracionService: FichaValoracionService,
  ) {}

  // GET /api/ficha-valoracion
  @Get()
  getAll() {
    return this.fichaValoracionService.getAll();
  }

  // POST /api/ficha-valoracion
  @Post()
  create(@Body() dto: { tipo_doc: string }) {
    return this.fichaValoracionService.create(dto);
  }

  // PUT /api/ficha-valoracion/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { tipo_doc: string },
  ) {
    return this.fichaValoracionService.update(id, dto);
  }

  // PATCH /api/ficha-valoracion/:id/toggle
  @Patch(':id/toggle')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.fichaValoracionService.toggleStatus(id);
  }
}
