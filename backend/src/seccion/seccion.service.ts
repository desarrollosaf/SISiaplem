import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TDepartamento } from '../models/t-departamento.model';
import { TDireccion } from '../models/t-direccion.model';
import { SeccionDirModel } from '../models/seccion-dir.model';
import { SeccionModel } from '../models/seccion.model';
import { SerieModel } from '../models/serie.model';
import { SubSerieModel } from '../models/sub-serie.model';
import { SubsubSerieModel } from '../models/subsub-serie.model';
import { SubfondoModel } from '../models/subfondo.model';
import { TipoDocModel } from '../models/tipo-doc.model';
import { TipoDocSerieModel } from '../models/tipo-doc-serie.model';
import { TipoSeccionModel } from '../models/tipo-seccion.model';

@Injectable()
export class SeccionService {
  constructor(
    @InjectModel(SeccionModel)
    private readonly seccionModel: typeof SeccionModel,
    @InjectModel(SerieModel)
    private readonly serieModel: typeof SerieModel,
    @InjectModel(SubSerieModel)
    private readonly subSerieModel: typeof SubSerieModel,
    @InjectModel(SubsubSerieModel)
    private readonly subsubSerieModel: typeof SubsubSerieModel,
    @InjectModel(SubfondoModel)
    private readonly subfondoModel: typeof SubfondoModel,
    @InjectModel(TipoSeccionModel)
    private readonly tipoSeccionModel: typeof TipoSeccionModel,
    @InjectModel(SeccionDirModel)
    private readonly seccionDirModel: typeof SeccionDirModel,
    @InjectModel(TipoDocModel)
    private readonly tipoDocModel: typeof TipoDocModel,
    @InjectModel(TipoDocSerieModel)
    private readonly tipoDocSerieModel: typeof TipoDocSerieModel,
    @InjectModel(TDepartamento, 'saf')
    private readonly departamentoModel: typeof TDepartamento,
    @InjectModel(TDireccion, 'saf')
    private readonly direccionModel: typeof TDireccion,
  ) {}

  // ── Catálogos ─────────────────────────────────────────────────────────────

  async getTipoSecciones() {
    return this.tipoSeccionModel.findAll({ order: [['id', 'ASC']] });
  }

  async getTipoDocumentales() {
    return this.tipoDocModel.findAll({
      where: { status: 1 },
      order: [['tipo_doc', 'ASC']],
    });
  }

  async getDirecciones(subfondoId: number) {
    const subfondo = await this.subfondoModel.findByPk(subfondoId);
    if (!subfondo) return [];

    const depe = subfondo.id_Dependencia;

    if (depe === 3) {
      const dirs = await this.direccionModel.findAll({
        where: { id_Dependencia: 3, Estado: 1 },
        order: [['nombre_completo', 'ASC']],
      });
      return dirs.map((d) => ({
        id: d.id_Direccion,
        label: d.nombre_completo,
      }));
    }

    const deptos = await this.departamentoModel.findAll({
      where: { id_Dependencia: depe },
      order: [['nombre_completo', 'ASC']],
    });
    const filtrados = deptos.filter((d) =>
      String(d.c_presup ?? '').endsWith('01'),
    );
    return filtrados.map((d) => ({
      id: d.id_Departamento,
      label: d.nombre_completo,
    }));
  }

  // Cuando el subfondo pertenece a la dependencia 3 (SAF), el checkbox "Dirección" lista
  // registros de t_direccion, no de t_departamento. Hay que traducir cada id_Direccion
  // seleccionado al id_Departamento real (mismo criterio que usa el sistema Laravel:
  // buscar en t_departamento por id_Direccion + c_presup), porque secciones_dir.id_Departamento
  // siempre debe apuntar a t_departamento.
  private async resolveDepartamentoIds(idDependencia: number | undefined, direccionIds: number[]): Promise<number[]> {
    if (idDependencia !== 3) return direccionIds;

    const direcciones = await this.direccionModel.findAll({ where: { id_Direccion: direccionIds } });
    const resueltos: number[] = [];
    for (const dir of direcciones) {
      const depto = await this.departamentoModel.findOne({
        where: { id_Direccion: dir.id_Direccion, c_presup: dir.c_presup },
      });
      if (depto) resueltos.push(depto.id_Departamento);
    }
    return resueltos;
  }

  async getAreaAdministrativa(idDireccion: number) {
    const deptos = await this.departamentoModel.findAll({
      where: { id_Direccion: idDireccion },
      order: [['nombre_completo', 'ASC']],
    });
    return deptos.map((d) => ({
      id: d.id_Departamento,
      label: d.nombre_completo,
    }));
  }

  async getDepartamentoInfo(id: number) {
    const depto = await this.departamentoModel.findByPk(id);
    if (!depto) return null;
    return { id_Direccion: depto.id_Direccion, label: depto.nombre_completo };
  }

  async getAreaNames(ids: number[]) {
    if (ids.length === 0) return [];
    const deptos = await this.departamentoModel.findAll({
      where: { id_Departamento: ids },
    });
    return deptos.map((d) => ({
      id: d.id_Departamento,
      label: d.nombre_completo,
    }));
  }

  // ── Secciones ─────────────────────────────────────────────────────────────

  async getBySub(subfondoId: number) {
    const subfondo = await this.subfondoModel.findByPk(subfondoId);
    const secciones = await this.seccionModel.findAll({
      where: { id_subfondo: subfondoId },
      order: [['codigo', 'ASC']],
    });
    const ids = secciones.map((s) => s.id);
    const dirs =
      ids.length > 0
        ? await this.seccionDirModel.findAll({ where: { id_seccion: ids } })
        : [];

    const seccionesConDirs = secciones.map((s) => ({
      ...s.toJSON(),
      direccion_ids: dirs
        .filter((d) => d.id_seccion === s.id)
        .map((d) => d.id_Departamento),
    }));

    return { subfondo, secciones: seccionesConDirs };
  }

  async findOne(id: number) {
    const seccion = await this.seccionModel.findByPk(id, {
      include: [
        {
          model: SerieModel,
          required: false,
          include: [
            {
              model: SubSerieModel,
              required: false,
              include: [{ model: SubsubSerieModel, required: false }],
            },
          ],
        },
      ],
    });
    if (!seccion) return null;

    const dirs = await this.seccionDirModel.findAll({ where: { id_seccion: id } });

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
    const seccionJson = seccion.toJSON() as Record<string, any>;
    const seriesRaw: any[] = seccionJson['series'] ?? [];

    if (seriesRaw.length > 0) {
      const serieIds: number[] = seriesRaw.map((s: any) => s.id);
      const tipoDocsSeries = await this.tipoDocSerieModel.findAll({
        where: { id_serie: serieIds },
      });

      const subseriesRaw: any[] = seriesRaw.flatMap(
        (s: any) => (s.subSeries as any[]) ?? [],
      );
      const subserieIds: number[] = subseriesRaw.map((ss: any) => ss.id);
      const tipoDocsSubseries =
        subserieIds.length > 0
          ? await this.tipoDocSerieModel.findAll({
              where: { id_subserie: subserieIds },
            })
          : [];

      const subsubseriesRaw: any[] = subseriesRaw.flatMap(
        (ss: any) => (ss.subsubSeries as any[]) ?? [],
      );
      const subsubserieIds: number[] = subsubseriesRaw.map((sss: any) => sss.id);
      const tipoDocsSubsubseries =
        subsubserieIds.length > 0
          ? await this.tipoDocSerieModel.findAll({
              where: { id_subsubserie: subsubserieIds },
            })
          : [];

      seccionJson['series'] = seriesRaw.map((ser: any) => {
        const tipoIds = tipoDocsSeries
          .filter((td) => td.id_serie === ser.id)
          .map((td) => td.id_tipo_doc);

        const subSeries = ((ser.subSeries as any[]) ?? []).map((sub: any) => {
          const subTipoIds = tipoDocsSubseries
            .filter((td) => td.id_subserie === sub.id)
            .map((td) => td.id_tipo_doc);

          const subsubSeries = ((sub.subsubSeries as any[]) ?? []).map(
            (sss: any) => ({
              ...sss,
              tipo_documental_ids: tipoDocsSubsubseries
                .filter((td) => td.id_subsubserie === sss.id)
                .map((td) => td.id_tipo_doc),
            }),
          );

          return { ...sub, tipo_documental_ids: subTipoIds, subsubSeries };
        });

        return { ...ser, tipo_documental_ids: tipoIds, subSeries };
      });
    }
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

    return {
      ...seccionJson,
      direccion_ids: dirs.map((d) => d.id_Departamento),
    };
  }

  async create(dto: {
    id_subfondo: number;
    codigo: string;
    seccion: string;
    id_tipo_seccion: number;
    direccion_ids?: number[];
  }) {
    const { direccion_ids, ...data } = dto;
    const sec = await this.seccionModel.create({ ...data, status: 1 });

    if (direccion_ids && direccion_ids.length > 0) {
      const subfondo = await this.subfondoModel.findByPk(dto.id_subfondo);
      const departamentoIds = await this.resolveDepartamentoIds(subfondo?.id_Dependencia, direccion_ids);
      await this.seccionDirModel.bulkCreate(
        departamentoIds.map((id_Departamento) => ({ id_seccion: sec.id, id_Departamento })),
      );
    }

    return sec;
  }

  async update(
    id: number,
    dto: {
      codigo: string;
      seccion: string;
      id_tipo_seccion: number;
      direccion_ids?: number[];
    },
  ) {
    const { direccion_ids, ...data } = dto;
    await this.seccionModel.update(data, { where: { id } });

    if (direccion_ids !== undefined) {
      await this.seccionDirModel.destroy({ where: { id_seccion: id } });
      if (direccion_ids.length > 0) {
        const seccion = await this.seccionModel.findByPk(id);
        const subfondo = seccion ? await this.subfondoModel.findByPk(seccion.id_subfondo) : null;
        const departamentoIds = await this.resolveDepartamentoIds(subfondo?.id_Dependencia, direccion_ids);
        await this.seccionDirModel.bulkCreate(
          departamentoIds.map((id_Departamento) => ({ id_seccion: id, id_Departamento })),
        );
      }
    }

    return { id, ...data };
  }

  async toggleStatus(id: number) {
    const sec = await this.seccionModel.findByPk(id);
    if (!sec) return null;
    const status = sec.status === 1 ? 0 : 1;

    const series = await this.serieModel.findAll({ where: { idSeccion: id } });
    for (const ser of series) {
      const subseries = await this.subSerieModel.findAll({ where: { idSerie: ser.id } });
      for (const sub of subseries) {
        await this.subsubSerieModel.update({ status }, { where: { idSubserie: sub.id } });
      }
      await this.subSerieModel.update({ status }, { where: { idSerie: ser.id } });
    }
    await this.serieModel.update({ status }, { where: { idSeccion: id } });
    await this.seccionModel.update({ status }, { where: { id } });

    return { id, status };
  }

  async remove(id: number) {
    const series = await this.serieModel.findAll({ where: { idSeccion: id } });
    for (const ser of series) {
      const subseries = await this.subSerieModel.findAll({ where: { idSerie: ser.id } });
      for (const sub of subseries) {
        await this.tipoDocSerieModel.destroy({ where: { id_subserie: sub.id } });
        await this.tipoDocSerieModel.destroy({ where: { id_subsubserie: sub.id } });
        await this.subsubSerieModel.destroy({ where: { idSubserie: sub.id } });
      }
      await this.tipoDocSerieModel.destroy({ where: { id_serie: ser.id } });
      await this.subSerieModel.destroy({ where: { idSerie: ser.id } });
    }
    await this.serieModel.destroy({ where: { idSeccion: id } });
    await this.seccionDirModel.destroy({ where: { id_seccion: id } });
    await this.seccionModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Series ────────────────────────────────────────────────────────────────

  async createSerie(dto: {
    idSeccion: number;
    codigo: string;
    serie: string;
    departamento_id?: number | null;
    tipo_documental_ids?: number[];
  }) {
    const { tipo_documental_ids, ...data } = dto;
    const ser = await this.serieModel.create({ ...data, status: 1 });

    if (tipo_documental_ids && tipo_documental_ids.length > 0) {
      await this.tipoDocSerieModel.bulkCreate(
        tipo_documental_ids.map((id_tipo_doc) => ({ id_serie: ser.id, id_tipo_doc })),
      );
    }

    return ser;
  }

  async updateSerie(
    id: number,
    dto: {
      codigo: string;
      serie: string;
      departamento_id?: number | null;
      tipo_documental_ids?: number[];
    },
  ) {
    const { tipo_documental_ids, ...data } = dto;
    await this.serieModel.update(data, { where: { id } });

    if (tipo_documental_ids !== undefined) {
      await this.tipoDocSerieModel.destroy({ where: { id_serie: id } });
      if (tipo_documental_ids.length > 0) {
        await this.tipoDocSerieModel.bulkCreate(
          tipo_documental_ids.map((id_tipo_doc) => ({ id_serie: id, id_tipo_doc })),
        );
      }
    }

    return { id, ...data };
  }

  async toggleSerie(id: number) {
    const ser = await this.serieModel.findByPk(id);
    if (!ser) return null;
    const status = ser.status === 1 ? 0 : 1;
    const subseries = await this.subSerieModel.findAll({ where: { idSerie: id } });
    for (const sub of subseries) {
      await this.subsubSerieModel.update({ status }, { where: { idSubserie: sub.id } });
    }
    await this.subSerieModel.update({ status }, { where: { idSerie: id } });
    await this.serieModel.update({ status }, { where: { id } });
    return { id, status };
  }

  async removeSerie(id: number) {
    const subseries = await this.subSerieModel.findAll({ where: { idSerie: id } });
    for (const sub of subseries) {
      await this.tipoDocSerieModel.destroy({ where: { id_subsubserie: sub.id } });
      await this.subsubSerieModel.destroy({ where: { idSubserie: sub.id } });
    }
    await this.tipoDocSerieModel.destroy({ where: { id_serie: id } });
    await this.subSerieModel.destroy({ where: { idSerie: id } });
    await this.serieModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Subseries ─────────────────────────────────────────────────────────────

  async createSubserie(dto: {
    idSerie: number;
    codigo: string;
    subserie: string;
    id_Departamento?: number | null;
    tipo_documental_ids?: number[];
  }) {
    const { tipo_documental_ids, ...data } = dto;
    const sub = await this.subSerieModel.create({ ...data, status: 1 });

    if (tipo_documental_ids && tipo_documental_ids.length > 0) {
      await this.tipoDocSerieModel.bulkCreate(
        tipo_documental_ids.map((id_tipo_doc) => ({ id_subserie: sub.id, id_tipo_doc })),
      );
    }

    return sub;
  }

  async updateSubserie(
    id: number,
    dto: {
      codigo: string;
      subserie: string;
      id_Departamento?: number | null;
      tipo_documental_ids?: number[];
    },
  ) {
    const { tipo_documental_ids, ...data } = dto;
    await this.subSerieModel.update(data, { where: { id } });

    if (tipo_documental_ids !== undefined) {
      await this.tipoDocSerieModel.destroy({ where: { id_subserie: id } });
      if (tipo_documental_ids.length > 0) {
        await this.tipoDocSerieModel.bulkCreate(
          tipo_documental_ids.map((id_tipo_doc) => ({ id_subserie: id, id_tipo_doc })),
        );
      }
    }

    return { id, ...data };
  }

  async toggleSubserie(id: number) {
    const sub = await this.subSerieModel.findByPk(id);
    if (!sub) return null;
    const status = sub.status === 1 ? 0 : 1;
    await this.subsubSerieModel.update({ status }, { where: { idSubserie: id } });
    await this.subSerieModel.update({ status }, { where: { id } });
    return { id, status };
  }

  async removeSubserie(id: number) {
    await this.tipoDocSerieModel.destroy({ where: { id_subserie: id } });
    await this.tipoDocSerieModel.destroy({ where: { id_subsubserie: id } });
    await this.subsubSerieModel.destroy({ where: { idSubserie: id } });
    await this.subSerieModel.destroy({ where: { id } });
    return { ok: true };
  }

  // ── Subsubseries ──────────────────────────────────────────────────────────

  async createSubsubserie(dto: {
    idSubserie: number;
    idSerie: number;
    codigo: string;
    subsubserie: string;
    id_departamento?: number | null;
    tipo_documental_ids?: number[];
  }) {
    const { tipo_documental_ids, ...data } = dto;
    const sss = await this.subsubSerieModel.create({ ...data, status: 1 });

    if (tipo_documental_ids && tipo_documental_ids.length > 0) {
      await this.tipoDocSerieModel.bulkCreate(
        tipo_documental_ids.map((id_tipo_doc) => ({ id_subsubserie: sss.id, id_tipo_doc })),
      );
    }

    return sss;
  }

  async updateSubsubserie(
    id: number,
    dto: {
      codigo: string;
      subsubserie: string;
      id_departamento?: number | null;
      tipo_documental_ids?: number[];
    },
  ) {
    const { tipo_documental_ids, ...data } = dto;
    await this.subsubSerieModel.update(data, { where: { id } });

    if (tipo_documental_ids !== undefined) {
      await this.tipoDocSerieModel.destroy({ where: { id_subsubserie: id } });
      if (tipo_documental_ids.length > 0) {
        await this.tipoDocSerieModel.bulkCreate(
          tipo_documental_ids.map((id_tipo_doc) => ({ id_subsubserie: id, id_tipo_doc })),
        );
      }
    }

    return { id, ...data };
  }

  async toggleSubsubserie(id: number) {
    const sss = await this.subsubSerieModel.findByPk(id);
    if (!sss) return null;
    const status = sss.status === 1 ? 0 : 1;
    await this.subsubSerieModel.update({ status }, { where: { id } });
    return { id, status };
  }

  async removeSubsubserie(id: number) {
    await this.tipoDocSerieModel.destroy({ where: { id_subsubserie: id } });
    await this.subsubSerieModel.destroy({ where: { id } });
    return { ok: true };
  }
}
