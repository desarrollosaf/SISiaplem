import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketModel } from 'src/models/ticket.model';
import { TicketDirectorioDetalleModel } from 'src/models/ticket-directorio-detalle.model';
import { TicketBajaDetalleModel } from 'src/models/ticket-baja-detalle.model';
import { TicketTransferenciaDetalleModel } from 'src/models/ticket-transferencia-detalle.model';
import { TicketPrestamoDetalleModel } from 'src/models/ticket-prestamo-detalle.model';
import { TicketHistorialModel } from 'src/models/ticket-historial.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TicketModel,
      TicketDirectorioDetalleModel,
      TicketBajaDetalleModel,
      TicketTransferenciaDetalleModel,
      TicketPrestamoDetalleModel,
      TicketHistorialModel,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
