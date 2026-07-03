import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AvisosService, CreateAvisoDto } from './avisos.service';

const pdfStorage = diskStorage({
  destination: './uploads/avisos',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `aviso-${unique}${extname(file.originalname)}`);
  },
});

@Controller('avisos')
export class AvisosController {
  constructor(private readonly svc: AvisosService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('recientes')
  findRecientes(@Query('limit') limit?: string) {
    return this.svc.findRecientes(limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('pdf', { storage: pdfStorage, limits: { fileSize: 10 * 1024 * 1024 } }))
  create(@Body() body: CreateAvisoDto, @UploadedFile() file: any) {
    const pdfPath = file ? `avisos/${file.filename}` : undefined;
    return this.svc.create(body, pdfPath);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('pdf', { storage: pdfStorage, limits: { fileSize: 10 * 1024 * 1024 } }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateAvisoDto>,
    @UploadedFile() file: any,
  ) {
    const pdfPath = file ? `avisos/${file.filename}` : undefined;
    return this.svc.update(id, body, pdfPath);
  }

  @Patch(':id/toggle')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.svc.toggleActivo(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
