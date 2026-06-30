import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubfondoService } from './subfondo.service';

@Controller('subfondo')
export class SubfondoController {
  constructor(
    private readonly subfondoService: SubfondoService,
    private readonly config: ConfigService,
  ) {}

  // GET /api/subfondo
  @Get()
  getAll() {
    return this.subfondoService.getAll();
  }

  // GET /api/subfondo/dependencias
  @Get('dependencias')
  getDependencias() {
    return this.subfondoService.getDependencias();
  }

  // GET /api/subfondo/cuadro
  @Get('cuadro')
  getCuadro() {
    const base = this.config.get<string>('ARCHIVO_URL', 'http://localhost:8000');
    return { url: `${base}/storage/files/CUDRO.pdf` };
  }

  // GET /api/subfondo/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subfondoService.findOne(id);
  }

  // POST /api/subfondo
  @Post()
  create(@Body() dto: { codigo: string; subfondo: string; id_Dependencia: number }) {
    return this.subfondoService.create(dto);
  }

  // PUT /api/subfondo/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { codigo: string; subfondo: string; id_Dependencia: number },
  ) {
    return this.subfondoService.update(id, dto);
  }

  // DELETE /api/subfondo/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subfondoService.remove(id);
  }
}
