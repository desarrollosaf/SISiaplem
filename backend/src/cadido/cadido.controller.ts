import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe, Put } from '@nestjs/common';
import { CadidoService } from './cadido.service';

@Controller('cadido')
export class CadidoController {
constructor(private readonly cadidoService: CadidoService) {}

@Get('getsubfondos')
getsubfondos(){
    return this.cadidoService.getsubfondos();
}

@Get(':id')
getcadido(@Param('id', ParseIntPipe) id: number){
    return this.cadidoService.getcadido(id);
}

@Get('getserie/:id/:tipo')
getserie(
  @Param('id', ParseIntPipe) id: number,
  @Param('tipo', ParseIntPipe) tipo: number){
    return this.cadidoService.getserie(id, tipo);
}

@Get('bitacora/:tipo/:id')
getBitacora(
  @Param('tipo', ParseIntPipe) tipo: number,
  @Param('id', ParseIntPipe) id: number){
    return this.cadidoService.getBitacora(tipo, id);
}

 @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      codigo: string;
      serie: string;
      anio_tramite: number;
      anios_consentracion: number;
      total_anios: number;
      id_destino: number;
      id_tecnica: number | null;
      valoresSeleccionados: number[],
      tipo: number,
      rfc: string,
    },
  ) {
    return this.cadidoService.update(id, dto);
  }
}
