import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ResponsablesService, ResponsableDto } from './responsables.service';

@Controller('responsables')
export class ResponsablesController {
  constructor(private readonly svc: ResponsablesService) {}

  @Get()
  getAll() { return this.svc.getAll(); }

  @Get('tipos-usuario')
  getTipos() { return this.svc.getTiposUsuario(); }

  @Get('dependencias')
  getDependencias() { return this.svc.getDependencias(); }

  @Get('departamentos')
  getDepartamentos(@Query('id_Dependencia', ParseIntPipe) id: number) {
    return this.svc.getDepartamentos(id);
  }

  @Get('usuarios')
  getUsuarios(@Query('id_Departamento', ParseIntPipe) id: number) {
    return this.svc.getUsuarios(id);
  }

  @Get('edificios')
  getEdificios() { return this.svc.getEdificios(); }

  @Post()
  create(@Body() dto: ResponsableDto) { return this.svc.create(dto); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ResponsableDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  @Put(':id/toggle-status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) { return this.svc.toggleStatus(id); }
}
