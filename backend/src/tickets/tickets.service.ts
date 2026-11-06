import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Op } from 'sequelize';
import { TicketModel } from 'src/models/ticket.model';
import { TicketDirectorioDetalleModel } from 'src/models/ticket-directorio-detalle.model';
import { TicketBajaDetalleModel } from 'src/models/ticket-baja-detalle.model';
import { TicketTransferenciaDetalleModel } from 'src/models/ticket-transferencia-detalle.model';
import { TicketPrestamoDetalleModel } from 'src/models/ticket-prestamo-detalle.model';
import { TicketHistorialModel } from 'src/models/ticket-historial.model';
import { TicketResponsableModel } from 'src/models/ticket-responsable.model';
import { UsersSafs } from 'src/models/users-safs.model';
import { ModelHasRole } from 'src/models/model-has-role.model';
import { RoleModel } from 'src/models/role.model';
import { MODEL_TYPE } from 'src/auth/auth.service';
import { SUsuario } from 'src/models/s-usuario.model';

// Dependencia con jerarquía propia (Órgano Superior de Fiscalización): usa
// rangos de auditoría en vez del esquema genérico de Secretario/Director/Jefe.
const DEPENDENCIA_FISCALIZACION = 3;

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

interface ResponsableDto {
  tipo_procedimiento?: string | null;
  rfc_responsable: string;
  nombre_responsable?: string;
}

interface AutorizarTitularDto {
  firmado: boolean;
  rfc_titular: string;
  // Placeholder hasta integrar la API real de firma electrónica (pendiente).
  password_firma?: string;
  rfc_actor: string;
  rol_actor?: string;
  comentario?: string;
  es_admin?: boolean;
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

  // Busca al responsable configurado para el tipo de procedimiento; si no hay
  // uno específico, cae al responsable "por defecto" (tipo_procedimiento NULL),
  // que funge como administrador de respaldo.
  private async resolverResponsable(
    tipo_procedimiento: string,
  ): Promise<TicketResponsableModel | null> {
    const especifico = await TicketResponsableModel.findOne({
      where: { tipo_procedimiento, activo: true },
    });
    if (especifico) return especifico;

    return TicketResponsableModel.findOne({
      where: { tipo_procedimiento: null, activo: true },
    });
  }

  // Nivel jerárquico de un puesto (1 = más alto). Lo que no coincide con
  // ningún rango conocido se considera personal operativo (el más bajo).
  // Usa "empieza con" en vez de "contiene" para no confundir, p.ej.,
  // "SECRETARIA DE JEFE DE DEPARTAMENTO" (asistente) con "JEFE" real.
  private clasificarPuesto(puesto: string | null, esFiscalizacion: boolean): number {
    const p = (puesto ?? '').toUpperCase().trim();
    if (p.startsWith('TITULAR')) return 1;
    if (esFiscalizacion) {
      if (p.startsWith('AUDITOR') && p.includes('SUPERIOR')) return 1;
      if (p.startsWith('AUDITOR')) return 2;
      if (p.startsWith('DIRECTOR')) return 3;
      if (p.startsWith('JEFE')) return 4;
      return 5; // operativo
    }
    if (p.startsWith('SECRETARIO')) return 1;
    if (p.startsWith('DIRECTOR')) return 2;
    if (p.startsWith('JEFE')) return 3;
    return 4; // operativo
  }

  // Determina quién debe autorizar (firma electrónica) el ticket de un RAT:
  // la persona activa de mayor jerarquía en su misma dirección (id_Direccion),
  // según el esquema de rangos de su dependencia. Si nadie en su dirección
  // supera el nivel operativo, no hay quien autorice y el ticket pasa
  // directo a Archivo (igual que si no existiera Titular).
  private async resolverTitular(
    rfc_solicitante: string | null | undefined,
  ): Promise<{ rfc_titular: string; nombre_titular: string | null; puesto_titular?: string | null } | null> {
    if (!rfc_solicitante) return null;

    const solicitante = await SUsuario.findOne({ where: { N_Usuario: rfc_solicitante } });
    if (!solicitante?.id_Direccion) return null;

    const esFiscalizacion = solicitante.id_Dependencia === DEPENDENCIA_FISCALIZACION;
    const nivelOperativo = esFiscalizacion ? 5 : 4;

    const companeros = await SUsuario.findAll({
      where: {
        id_Direccion: solicitante.id_Direccion,
        Estado: 1,
        N_Usuario: { [Op.ne]: rfc_solicitante },
      },
    });

    let mejor: { rfc: string; nombre: string; puesto: string; rango: number } | null = null;
    for (const u of companeros) {
      const rango = this.clasificarPuesto(u.Puesto, esFiscalizacion);
      if (rango >= nivelOperativo) continue;
      if (!mejor || rango < mejor.rango || (rango === mejor.rango && u.Nombre < mejor.nombre)) {
        mejor = { rfc: u.N_Usuario, nombre: u.Nombre, puesto: u.Puesto, rango };
      }
    }
    if (!mejor) return null;

    return { rfc_titular: mejor.rfc, nombre_titular: mejor.nombre, puesto_titular: mejor.puesto };
  }

  // Busca un usuario real con rol ADMIM para usarlo como respaldo final
  // cuando no hay ningún responsable configurado en el catálogo.
  private async resolverAdministrador(): Promise<UsersSafs | null> {
    const role = await RoleModel.findOne({ where: { name: 'ADMIM' } });
    if (!role) return null;

    const pivot = await ModelHasRole.findOne({
      where: { role_id: role.id, model_type: MODEL_TYPE },
      order: [['model_id', 'ASC']],
    });
    if (!pivot) return null;

    return UsersSafs.findByPk(pivot.model_id);
  }

  // Asigna el ticket al responsable configurado (específico o "por defecto")
  // y lo marca en_proceso. Si no hay ningún responsable configurado en el
  // catálogo, cae sobre un usuario real con rol ADMIM — se usa tanto al crear
  // (si no requiere autorización) como al autorizar un ticket que sí la requería.
  private async asignarResponsableAutomatico(ticket: TicketModel) {
    const responsable = await this.resolverResponsable(ticket.tipo_procedimiento);
    if (responsable) {
      await ticket.update({ rfc_asignado: responsable.rfc_responsable, estado: 'en_proceso' });
      const esPorDefecto = responsable.tipo_procedimiento === null;
      await this.registrarHistorial(
        ticket.id,
        undefined,
        'Sistema',
        esPorDefecto
          ? `Asignado automáticamente al responsable por defecto (${responsable.rfc_responsable})`
          : `Asignado automáticamente a ${responsable.rfc_responsable}`,
        'en_proceso',
      );
      return;
    }

    const admin = await this.resolverAdministrador();
    if (!admin) return;

    await ticket.update({ rfc_asignado: admin.rfc, estado: 'en_proceso' });
    await this.registrarHistorial(
      ticket.id,
      undefined,
      'Sistema',
      `Sin responsable configurado: asignado automáticamente al administrador (${admin.rfc})`,
      'en_proceso',
    );
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

    const titular = await this.resolverTitular(dto.rfc_solicitante);
    if (titular) {
      // Requiere autorización del Titular antes de turnarse a Archivo.
      await ticket.update({ estado: 'pendiente_autorizacion', rfc_titular: titular.rfc_titular });
      const nombreTitular = titular.nombre_titular ?? titular.rfc_titular;
      const detalleTitular = titular.puesto_titular ? `${nombreTitular} — ${titular.puesto_titular}` : nombreTitular;
      await this.registrarHistorial(
        ticket.id,
        undefined,
        'Sistema',
        `Pendiente de autorización del Titular (${detalleTitular})`,
        'pendiente_autorizacion',
      );
    } else {
      // Sin Titular configurado para este solicitante: pasa directo a Archivo.
      await this.asignarResponsableAutomatico(ticket);
    }

    return this.obtener(ticket.id);
  }

  async listar(filtros: {
    tipo_procedimiento?: string;
    estado?: string;
    rfc_solicitante?: string;
    // Visibilidad: un ADMIM ve todo; cualquier otro usuario solo ve lo que
    // él levantó, lo que tiene asignado para atender, o lo que debe autorizar
    // como Titular.
    rfc_usuario?: string;
    es_admin?: boolean;
  }) {
    const where: Record<string | symbol, unknown> = {};
    if (filtros.tipo_procedimiento) where.tipo_procedimiento = filtros.tipo_procedimiento;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.rfc_solicitante) where.rfc_solicitante = filtros.rfc_solicitante;

    if (!filtros.es_admin && filtros.rfc_usuario) {
      where[Op.or] = [
        { rfc_solicitante: filtros.rfc_usuario },
        { rfc_asignado: filtros.rfc_usuario },
        { rfc_titular: filtros.rfc_usuario },
      ];
    }

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

  // Autorización del Titular (firma electrónica). Mientras no exista la API real,
  // "firmado: true" simula una firma válida — el flujo y la bitácora ya quedan
  // listos para conectar la validación real sin tocar el resto del sistema.
  async autorizarTitular(id: number, dto: AutorizarTitularDto) {
    const ticket = await TicketModel.findByPk(id);
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    // Solo el Titular configurado para este ticket (o un ADMIM) puede
    // firmar la autorización — evita que el propio RAT u otro usuario
    // se autoapruebe su ticket.
    if (!dto.es_admin && ticket.rfc_titular && dto.rfc_actor !== ticket.rfc_titular) {
      throw new ForbiddenException('Solo el Titular asignado a este ticket puede autorizarlo.');
    }

    if (!dto.firmado) {
      await ticket.update({ estado: 'rechazado' });
      await this.registrarHistorial(
        id,
        dto.rfc_actor,
        dto.rol_actor ?? 'Titular',
        dto.comentario ?? `Rechazado por el Titular (${dto.rfc_titular})`,
        'rechazado',
      );
      return this.obtener(id);
    }

    await this.registrarHistorial(
      id,
      dto.rfc_actor,
      dto.rol_actor ?? 'Titular',
      `Autorizado por el Titular mediante firma electrónica (${dto.rfc_titular})`,
      'autorizado',
    );

    await this.asignarResponsableAutomatico(ticket);

    return this.obtener(id);
  }

  // ── Administración de responsables ──────────────────────────────────────

  async listarResponsables() {
    return TicketResponsableModel.findAll({ order: [['tipo_procedimiento', 'ASC']] });
  }

  async crearResponsable(dto: ResponsableDto) {
    return TicketResponsableModel.create({
      tipo_procedimiento: dto.tipo_procedimiento ?? null,
      rfc_responsable: dto.rfc_responsable,
      nombre_responsable: dto.nombre_responsable ?? null,
    });
  }

  async actualizarResponsable(id: number, dto: ResponsableDto) {
    const responsable = await TicketResponsableModel.findByPk(id);
    if (!responsable) throw new NotFoundException('Responsable no encontrado');

    await responsable.update({
      tipo_procedimiento: dto.tipo_procedimiento ?? null,
      rfc_responsable: dto.rfc_responsable,
      nombre_responsable: dto.nombre_responsable ?? null,
    });
    return responsable;
  }

  async toggleResponsable(id: number) {
    const responsable = await TicketResponsableModel.findByPk(id);
    if (!responsable) throw new NotFoundException('Responsable no encontrado');

    await responsable.update({ activo: !responsable.activo });
    return responsable;
  }
}
