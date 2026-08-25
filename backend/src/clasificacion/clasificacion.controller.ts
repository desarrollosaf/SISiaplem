import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SUsuario } from 'src/models/s-usuario.model';

@Controller('clasificacion')
export class ClasificacionController {
  constructor(private readonly clasificacionService: ClasificacionService) {}


  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const rfc = req.user.rfc;
    return this.clasificacionService.findAll(rfc);
  }

  @Get('getsolicitudes')
  @UseGuards(JwtAuthGuard)
  async getsolicitudes(@Request() req: any) {
    const rfc = req.user.rfc;
    return this.clasificacionService.getsolicitudes(rfc);
  }

  @Get('getTipo')
  async getTipo(){
    return this.clasificacionService.getTipo();
  }

  @Get('getDeptos')
  @UseGuards(JwtAuthGuard)
  async getDeptos(@Request() req: any){
    const rfc = req.user.rfc;
    return this.clasificacionService.getDeptos(rfc);
  }

  @Get('gettipotramitemov')
  async gettipotramitemov(){
    return this.clasificacionService.gettipotramitemov();
  }

  @Get('getseccion')
  @UseGuards(JwtAuthGuard)
  async getseccion(@Request() req: any){
    const rfc = req.user.rfc;
    return this.clasificacionService.getseccion(rfc);
  }

  
@Get('getseries')
  @UseGuards(JwtAuthGuard)
  async getseries(@Request() req: any){
    const rfc = req.user.rfc;
    return this.clasificacionService.getseries(rfc);
  }

@Get('getsubseries')
  @UseGuards(JwtAuthGuard)
  async getsubseries(@Request() req: any){
    const rfc = req.user.rfc;
    return this.clasificacionService.getsubseries(rfc);
  }

@Get('getSolicitudesAdmin')
  async getSolicitudesAdmin(){
  return this.clasificacionService.getSolicitudesAdmin();
  }

  @Get('getstatus')
  async getstatus(){
    return this.clasificacionService.getstatus();
  }

@Get('getSolicitud/:id')
  async getSolicitud(@Param('id', ParseIntPipe) id: number){
    return this.clasificacionService.getSolicitud(id);
  }

@Post('saveSolicitud')
 @UseGuards(JwtAuthGuard)
  saveSolicitud(@Body() form, @Request() req: any) {
    const rfc = req.user.rfc;
    return this.clasificacionService.saveSolicitud(form, rfc);
  }

  @Post('editSolicitud')
  editSolicitud(@Body() form){
    return this.clasificacionService.editSolicitud(form);
  }





}


