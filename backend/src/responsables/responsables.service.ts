import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponsableArchivoModel } from '../models/responsable-archivo.model';
import { TipoUsuarioModel } from '../models/tipos-usuario.model';
import { TDependencia } from '../models/t-dependencia.model';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SUsuario } from '../models/s-usuario.model';
import { UsersSafs } from '../models/users-safs.model';
import { ModelHasRole } from '../models/model-has-role.model';
import { RoleModel } from '../models/role.model';

export const MODEL_TYPE = 'App\\Models\\UsersSaf';

const TIPO_ROL: Record<string, string> = {
  'Administrador':                          'ADMIM',
  'Responsable de archivo de trámite':      'RAT',
  'Responsable de archivo de concentración':'RAC',
  'Responsable de archivo historico':       'RAH',
};

export class ResponsableDto {
  tipo_id!: number;
  rfc_responsable!: string;
  id_Departamento!: number;
  email?: string;
  tel?: string;
  ext?: string;
  id_edificio?: number;
}

@Injectable()
export class ResponsablesService {
  constructor(
    @InjectModel(ResponsableArchivoModel)
    private readonly responsableModel: typeof ResponsableArchivoModel,
    @InjectModel(TipoUsuarioModel)
    private readonly tipoModel: typeof TipoUsuarioModel,
    @InjectModel(ModelHasRole)
    private readonly mhrModel: typeof ModelHasRole,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
    @InjectModel(TDependencia, 'saf')
    private readonly dependenciaModel: typeof TDependencia,
    @InjectModel(TDepartamento, 'saf')
    private readonly departamentoModel: typeof TDepartamento,
    @InjectModel(TDireccion, 'saf')
    private readonly direccionModel: typeof TDireccion,
    @InjectModel(SUsuario, 'saf')
    private readonly usuarioModel: typeof SUsuario,
    @InjectModel(UsersSafs, 'saf')
    private readonly usersSafsModel: typeof UsersSafs,
  ) {}

  async getAll() {
    const rows  = await this.responsableModel.findAll({ order: [['id', 'DESC']] });
    const tipos = await this.tipoModel.findAll();

    const deptIds = [...new Set(rows.map(r => r.id_Departamento).filter(Boolean))];
    const rfcs    = [...new Set(rows.map(r => r.rfc_responsable).filter(Boolean))];
    const edifIds = [...new Set(rows.map(r => r.id_edificio).filter(Boolean))];

    const [deptosRaw, usuariosRaw, edificiosRaw] = await Promise.all([
      deptIds.length ? this.departamentoModel.findAll({ where: { id_Departamento: deptIds } }) : Promise.resolve([] as TDepartamento[]),
      rfcs.length    ? this.usuarioModel.findAll({ where: { N_Usuario: rfcs } })               : Promise.resolve([] as SUsuario[]),
      edifIds.length ? this.direccionModel.findAll({ where: { id_Direccion: edifIds } })       : Promise.resolve([] as TDireccion[]),
    ]);
    const deptos   = deptosRaw   as TDepartamento[];
    const usuarios = usuariosRaw as SUsuario[];
    const edificios = edificiosRaw as TDireccion[];

    const depIds = [...new Set(deptos.map(d => d.id_Dependencia).filter(Boolean))];
    const depsRaw = depIds.length
      ? await this.dependenciaModel.findAll({ where: { id_Dependencia: depIds } })
      : [] as TDependencia[];
    const deps = depsRaw as TDependencia[];

    const deptoMap = new Map<number, TDepartamento>(deptos.map(d => [d.id_Departamento, d]));
    const depMap   = new Map<number, string>(deps.map(d => [d.id_Dependencia, d.nombre_completo]));
    const userMap  = new Map<string, SUsuario>(usuarios.map(u => [u.N_Usuario, u]));
    const tipoMap  = new Map<number, string>(tipos.map(t => [Number(t.id), t.tipo]));
    const edifMap  = new Map<number, string>(edificios.map(e => [e.id_Direccion, e.nombre_completo]));

    return rows.map(r => {
      const depto = deptoMap.get(r.id_Departamento);
      const user  = userMap.get(r.rfc_responsable);
      return {
        id: r.id,
        tipo_id: r.tipo_id,
        tipo_nombre: tipoMap.get(r.tipo_id) ?? '—',
        rfc_responsable: r.rfc_responsable,
        nombre_responsable: user
          ? `${user.Nombre} ${user.A_Paterno ?? ''} ${user.A_Materno ?? ''}`.trim()
          : (r.rfc_responsable ?? '—'),
        id_Departamento: r.id_Departamento,
        nombre_departamento: depto?.nombre_completo ?? '—',
        id_Dependencia: depto?.id_Dependencia ?? null,
        nombre_dependencia: depto ? (depMap.get(depto.id_Dependencia) ?? '—') : '—',
        email: r.email,
        tel: r.tel,
        ext: r.ext,
        id_edificio: r.id_edificio,
        nombre_edificio: edifMap.get(r.id_edificio) ?? '—',
        status: r.status,
      };
    });
  }

  async getTiposUsuario() {
    return this.tipoModel.findAll({ order: [['tipo', 'ASC']] });
  }

  async getDependencias() {
    return this.dependenciaModel.findAll({ order: [['nombre_completo', 'ASC']] });
  }

  async getDepartamentos(id_Dependencia: number) {
    return this.departamentoModel.findAll({ where: { id_Dependencia }, order: [['nombre_completo', 'ASC']] });
  }

  async getUsuarios(id_Departamento: number) {
    const rows = await this.usuarioModel.findAll({
      where: { id_Departamento, Estado: { [Op.ne]: 0 } },
      order: [['Nombre', 'ASC']],
    });
    return rows.map(u => ({
      rfc: u.N_Usuario,
      nombre: `${u.Nombre} ${u.A_Paterno ?? ''} ${u.A_Materno ?? ''}`.trim(),
    }));
  }

  async getEdificios() {
    return this.direccionModel.findAll({ order: [['nombre_completo', 'ASC']] });
  }

  async create(dto: ResponsableDto) {
    const row = await this.responsableModel.create({ ...dto, status: true } as any);
    await this.assignRoleByTipo(dto.rfc_responsable, dto.tipo_id);
    return row;
  }

  async update(id: number, dto: ResponsableDto) {
    const existing = await this.responsableModel.findByPk(id);
    if (existing && existing.tipo_id !== dto.tipo_id) {
      await this.removeRoleByTipo(existing.rfc_responsable, existing.tipo_id);
    }
    await this.responsableModel.update(dto, { where: { id } });
    await this.assignRoleByTipo(dto.rfc_responsable, dto.tipo_id);
    return { id, ...dto };
  }

  async remove(id: number) {
    const row = await this.responsableModel.findByPk(id);
    if (row) await this.removeRoleByTipo(row.rfc_responsable, row.tipo_id);
    await this.responsableModel.destroy({ where: { id } });
    return { ok: true };
  }

  async toggleStatus(id: number) {
    const row = await this.responsableModel.findByPk(id);
    if (!row) return { ok: false };
    const newStatus = !row.status;
    await row.update({ status: newStatus });
    return { ok: true, status: newStatus };
  }

  // ── helpers de rol ─────────────────────────────────────────────────────────

  private async assignRoleByTipo(rfc: string, tipo_id: number) {
    const rfcClean = (rfc ?? '').trim();
    if (!rfcClean || !tipo_id) {
      console.warn('[assignRoleByTipo] rfc o tipo_id vacíos', { rfc, tipo_id });
      return;
    }
    const tipo = await this.tipoModel.findByPk(tipo_id);
    if (!tipo) {
      console.warn('[assignRoleByTipo] tipo_id no encontrado en tipos_usuarios:', tipo_id);
      return;
    }
    const roleName = TIPO_ROL[tipo.tipo];
    if (!roleName) {
      console.warn('[assignRoleByTipo] sin mapeo de rol para tipo:', tipo.tipo);
      return;
    }
    const role = await this.roleModel.findOne({ where: { name: roleName } });
    if (!role) {
      console.warn('[assignRoleByTipo] rol no encontrado en roles con name:', roleName);
      return;
    }
    const user = await this.usersSafsModel.findOne({ where: { rfc: rfcClean } });
    if (!user) {
      console.warn('[assignRoleByTipo] usuario no encontrado en users_safs con rfc:', rfcClean);
      return;
    }
    console.log(`[assignRoleByTipo] asignando rol "${tipo.tipo}" (id=${role.id}) a user id=${user.id} (rfc=${rfcClean})`);
    await this.mhrModel.findOrCreate({
      where: { role_id: role.id, model_type: MODEL_TYPE, model_id: user.id },
      defaults: { role_id: role.id, model_type: MODEL_TYPE, model_id: user.id },
    });
  }

  private async removeRoleByTipo(rfc: string, tipo_id: number) {
    const rfcClean = (rfc ?? '').trim();
    if (!rfcClean || !tipo_id) return;
    const tipo = await this.tipoModel.findByPk(tipo_id);
    if (!tipo) return;
    const roleName = TIPO_ROL[tipo.tipo];
    if (!roleName) return;
    const role = await this.roleModel.findOne({ where: { name: roleName } });
    if (!role) return;
    const user = await this.usersSafsModel.findOne({ where: { rfc: rfcClean } });
    if (!user) return;
    await this.mhrModel.destroy({ where: { role_id: role.id, model_type: MODEL_TYPE, model_id: user.id } });
  }
}
