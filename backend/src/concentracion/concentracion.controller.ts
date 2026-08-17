import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConcentracionService } from './concentracion.service';

@Controller('concentracion')
export class ConcentracionController {
  constructor(private readonly concentracionService: ConcentracionService) {}

  // GET /api/concentracion/baja-documental/pdf?rfc=XXXX
  @Get('baja-documental/pdf')
  async bajaDocumentalPdf(@Query('rfc') rfc: string, @Res() res: Response) {
    const buffer = await this.concentracionService.getBajaDocumentalPdf(
      rfc ?? '',
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="InventarioDeBajaDocumental.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/concentracion/inventario-general/pdf?rfc=XXXX
  @Get('inventario-general/pdf')
  async inventarioGeneralPdf(@Query('rfc') rfc: string, @Res() res: Response) {
    const buffer = await this.concentracionService.getInventarioGeneralPdf(
      rfc ?? '',
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="InventarioGeneralDeArchivoDeConcentracion.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/concentracion/transferencia-secundaria/pdf?rfc=XXXX
  @Get('transferencia-secundaria/pdf')
  async transferenciaSecundariaPdf(
    @Query('rfc') rfc: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.concentracionService.getTransferenciaSecundariaPdf(rfc ?? '');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="InventarioDeTransferenciaSecundaria.pdf"',
    });
    res.send(buffer);
  }

  // GET /api/concentracion/calendario-caducidades/pdf?rfc=XXXX
  @Get('calendario-caducidades/pdf')
  async calendarioCaducidadesPdf(
    @Query('rfc') rfc: string,
    @Res() res: Response,
  ) {
    const buffer = await this.concentracionService.getCalendarioCaducidadesPdf(
      rfc ?? '',
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="CalendarioDeCaducidades.pdf"',
    });
    res.send(buffer);
  }
}
