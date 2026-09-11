import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { TicketModel } from 'src/models/ticket.model';
import { TicketDirectorioDetalleModel } from 'src/models/ticket-directorio-detalle.model';
import { TicketBajaDetalleModel } from 'src/models/ticket-baja-detalle.model';
import { TicketTransferenciaDetalleModel } from 'src/models/ticket-transferencia-detalle.model';
import { TicketPrestamoDetalleModel } from 'src/models/ticket-prestamo-detalle.model';
import { TicketHistorialModel } from 'src/models/ticket-historial.model';

export type TipoProcedimiento =
  | 'directorio_responsables'
  | 'asesoria_tecnica'
  | 'baja_documental'
  | 'transferencia_primaria'
  | 'prestamo_consulta';

interface CrearTicketDto {
  tipo_procedimiento: TipoProcedimiento;
  asunto: string;
  categoria?: string;
  descripcion?: string;
  id_dependencia?: number;
  id_unidad_administrativa?: number;
  rfc_solicitante?: string;
  nombre_solicitante?: string;
  correo_solicitante?: string;
  extension_solicitante?: string;
  numero_oficio_turno?: string;
  rfc_actor: string;
  rol_actor?: string;
  // Detalle directorio_responsables
  subtipo?: string;
  nombre_completo_entrante?: string;
  cargo_puesto?: string;
  correo_institucional?: string;
  telefono_extension?: string;
  ruta_oficio_designacion?: string;
  // Detalle transferencia_primaria
  id_solicitud_transferencia?: number;
  // Detalle prestamo_consulta
  id_solicitud_consulta?: number;
  tipo_solicitud_prestamo?: string;
  persona_habilitada?: string;
}

interface AsignarTicketDto {
  rfc_asignado: string;
  fecha_programada?: string;
  modalidad_lugar?: string;
  rfc_actor: string;
  rol_actor?: string;
}

interface CambiarEstadoDto {
  estado: string;
  rfc_actor: string;
  rol_actor?: string;
  comentario?: string;
}

interface CerrarTicketDto {
  ruta_acta?: string;
  comentarios_cierre?: string;
  rfc_actor: string;
  rol_actor?: string;
  dictamen_procedencia?: string;
  programacion_traslado?: string;
}

const INCLUDES = [
  { model: TicketDirectorioDetalleModel },
  { model: TicketBajaDetalleModel },
  { model: TicketTransferenciaDetalleModel },
  { model: TicketPrestamoDetalleModel },
  { model: TicketHistorialModel },
];

@Injectable()
export class TicketsService {
  private async generarFolio(): Promise<string> {
    const anio = new Date().getFullYear();
    const count = await TicketModel.count({
      where: { folio: { [Op.like]: `TK-${anio}-%` } },
    });
    const consecutivo = String(count + 1).padStart(3, '0');
    return `TK-${anio}-${consecutivo}`;
  }

  private async registrarHistorial(
    id_ticket: number,
    rfc_actor: string | undefined,
    rol_actor: string | undefined,
    accion: string,
    estado_resultante?: string,
  ) {
    await TicketHistorialModel.create({
      id_ticket,
      rfc_actor: rfc_actor ?? null,
      rol_actor: rol_actor ?? null,
      accion,
      estado_resultante: estado_resultante ?? null,
    });
  }

  async crear(dto: CrearTicketDto) {
    const folio = await this.generarFolio();

    const ticket = await TicketModel.create({
      folio,
      tipo_procedimiento: dto.tipo_procedimiento,
      asunto: dto.asunto,
      categoria: dto.categoria ?? null,
      descripcion: dto.descripcion ?? null,
      id_dependencia: dto.id_dependencia ?? null,
      id_unidad_administrativa: dto.id_unidad_administrativa ?? null,
      rfc_solicitante: dto.rfc_solicitante ?? null,
      nombre_solicitante: dto.nombre_solicitante ?? null,
      correo_solicitante: dto.correo_solicitante ?? null,
      extension_solicitante: dto.extension_solicitante ?? null,
      numero_oficio_turno: dto.numero_oficio_turno ?? null,
      estado: 'nuevo',
    });

    if (dto.tipo_procedimiento === 'directorio_responsables') {
      await TicketDirectorioDetalleModel.create({
        id_ticket: ticket.id,
        subtipo: dto.subtipo ?? null,
        nombre_completo_entrante: dto.nombre_completo_entrante ?? null,
        cargo_puesto: dto.cargo_puesto ?? null,
        correo_institucional: dto.correo_institucional ?? null,
        telefono_extension: dto.telefono_extension ?? null,
        ruta_oficio_designacion: dto.ruta_oficio_designacion ?? null,
      });
    }

    if (dto.tipo_procedimiento === 'baja_documental') {
      await TicketBajaDetalleModel.create({ id_ticket: ticket.id });
    }

    if (dto.tipo_procedimiento === 'transferencia_primaria') {
      await TicketTransferenciaDetalleModel.create({
        id_ticket: ticket.id,
        id_solicitud_transferencia: dto.id_solicitud_transferencia ?? null,
      });
    }

    if (dto.tipo_procedimiento === 'prestamo_consulta') {
      await TicketPrestamoDetalleModel.create({
        id_ticket: ticket.id,
        id_solicitud_consulta: dto.id_solicitud_consulta ?? null,
        tipo_solicitud: dto.tipo_solicitud_prestamo ?? null,
        persona_habilitada: dto.persona_habilitada ?? null,
      });
    }

    await this.registrarHistorial(
      ticket.id,
      dto.rfc_actor,
      dto.rol_actor ?? 'Sistema',
      `Ticket creado (${dto.tipo_procedimiento})`,
      'nuevo',
    );

    return this.obtener(ticket.id);
  }

  async listar(filtros: { tipo_procedimiento?: string; estado?: string; rfc_solicitante?: string }) {
    const where: Record<string, unknown> = {};
    if (filtros.tipo_procedimiento) where.tipo_procedimiento = filtros.tipo_procedimiento;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.rfc_solicitante) where.rfc_solicitante = filtros.rfc_solicitante;

    return TicketModel.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async obtener(id: number) {
    const ticket = await TicketModel.findByPk(id, { include: INCLUDES });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    const json = ticket.toJSON() as Record<string, unknown> & { historial?: unknown[] };
    json.historial = ((json.historial as { created_at: Date }[]) ?? []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return json;
  }

  async asignar(id: number, dto: AsignarTicketDto) {
    const ticket = await TicketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    const estado = dto.fecha_programada ? 'programado' : 'en_proceso';

    await ticket.update({
      rfc_asignado: dto.rfc_asignado,
      fecha_programada: dto.fecha_programada ?? null,
      modalidad_lugar: dto.modalidad_lugar ?? null,
      estado,
    });

    const detalle = dto.fecha_programada
      ? `Asignado a ${dto.rfc_asignado}, programado para ${dto.fecha_programada}`
      : `Asignado a ${dto.rfc_asignado}`;

    await this.registrarHistorial(id, dto.rfc_actor, dto.rol_actor, detalle, estado);

    return this.obtener(id);
  }

  async cambiarEstado(id: number, dto: CambiarEstadoDto) {
    const ticket = await TicketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    await ticket.update({ estado: dto.estado });

    await this.registrarHistorial(
      id,
      dto.rfc_actor,
      dto.rol_actor,
      dto.comentario ?? `Estado actualizado a "${dto.estado}"`,
      dto.estado,
    );

    return this.obtener(id);
  }

  async cerrar(id: number, dto: CerrarTicketDto) {
    const ticket = await TicketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    await ticket.update({
      estado: 'cerrado',
      ruta_acta: dto.ruta_acta ?? null,
      comentarios_cierre: dto.comentarios_cierre ?? null,
    });

    if (ticket.tipo_procedimiento === 'baja_documental') {
      const detalle = await TicketBajaDetalleModel.findOne({ where: { id_ticket: id } });
      if (detalle) {
        await detalle.update({
          dictamen_procedencia: dto.dictamen_procedencia ?? detalle.dictamen_procedencia,
          programacion_traslado: dto.programacion_traslado ?? detalle.programacion_traslado,
        });
      }
    }

    await this.registrarHistorial(id, dto.rfc_actor, dto.rol_actor, 'Ticket cerrado', 'cerrado');

    return this.obtener(id);
  }
}
