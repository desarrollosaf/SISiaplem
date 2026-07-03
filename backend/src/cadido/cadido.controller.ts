import { Controller, Get, Post, Patch, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
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



}
