import type { Sequelize } from "sequelize";
import { Agendas as _Agendas } from "./agendas";
import type { AgendasAttributes, AgendasCreationAttributes } from "./agendas";
import { Answers as _Answers } from "./answers";
import type { AnswersAttributes, AnswersCreationAttributes } from "./answers";
import { Atencion as _Atencion } from "./atencion";
import type { AtencionAttributes, AtencionCreationAttributes } from "./atencion";
import { AtencionDocs as _AtencionDocs } from "./atencion_docs";
import type { AtencionDocsAttributes, AtencionDocsCreationAttributes } from "./atencion_docs";
import { Autorizados as _Autorizados } from "./autorizados";
import type { AutorizadosAttributes, AutorizadosCreationAttributes } from "./autorizados";
import { AvisosTerminos as _AvisosTerminos } from "./avisos_terminos";
import type { AvisosTerminosAttributes, AvisosTerminosCreationAttributes } from "./avisos_terminos";
import { BitacoraClasificacions as _BitacoraClasificacions } from "./bitacora_clasificacions";
import type { BitacoraClasificacionsAttributes, BitacoraClasificacionsCreationAttributes } from "./bitacora_clasificacions";
import { Cache as _Cache } from "./cache";
import type { CacheAttributes, CacheCreationAttributes } from "./cache";
import { CacheLocks as _CacheLocks } from "./cache_locks";
import type { CacheLocksAttributes, CacheLocksCreationAttributes } from "./cache_locks";
import { Comentarios as _Comentarios } from "./comentarios";
import type { ComentariosAttributes, ComentariosCreationAttributes } from "./comentarios";
import { Comments as _Comments } from "./comments";
import type { CommentsAttributes, CommentsCreationAttributes } from "./comments";
import { Concentracions as _Concentracions } from "./concentracions";
import type { ConcentracionsAttributes, ConcentracionsCreationAttributes } from "./concentracions";
import { ContenidoExpedientes as _ContenidoExpedientes } from "./contenido_expedientes";
import type { ContenidoExpedientesAttributes, ContenidoExpedientesCreationAttributes } from "./contenido_expedientes";
import { ControlPermisosDocumentos as _ControlPermisosDocumentos } from "./controlPermisosDocumentos";
import type { ControlPermisosDocumentosAttributes, ControlPermisosDocumentosCreationAttributes } from "./controlPermisosDocumentos";
import { DestinoFinals as _DestinoFinals } from "./destino_finals";
import type { DestinoFinalsAttributes, DestinoFinalsCreationAttributes } from "./destino_finals";
import { DocumentosApoyos as _DocumentosApoyos } from "./documentos_apoyos";
import type { DocumentosApoyosAttributes, DocumentosApoyosCreationAttributes } from "./documentos_apoyos";
import { DocumentosEnvios as _DocumentosEnvios } from "./documentos_envios";
import type { DocumentosEnviosAttributes, DocumentosEnviosCreationAttributes } from "./documentos_envios";
import { ExpedienteSerieSubses as _ExpedienteSerieSubses } from "./expediente_serie_subses";
import type { ExpedienteSerieSubsesAttributes, ExpedienteSerieSubsesCreationAttributes } from "./expediente_serie_subses";
import { FailedJobs as _FailedJobs } from "./failed_jobs";
import type { FailedJobsAttributes, FailedJobsCreationAttributes } from "./failed_jobs";
import { FirmaDocs as _FirmaDocs } from "./firma_docs";
import type { FirmaDocsAttributes, FirmaDocsCreationAttributes } from "./firma_docs";
import { Folios as _Folios } from "./folios";
import type { FoliosAttributes, FoliosCreationAttributes } from "./folios";
import { Groups as _Groups } from "./groups";
import type { GroupsAttributes, GroupsCreationAttributes } from "./groups";
import { InventarioConcentracions as _InventarioConcentracions } from "./inventario_concentracions";
import type { InventarioConcentracionsAttributes, InventarioConcentracionsCreationAttributes } from "./inventario_concentracions";
import { InventarioFisicos as _InventarioFisicos } from "./inventario_fisicos";
import type { InventarioFisicosAttributes, InventarioFisicosCreationAttributes } from "./inventario_fisicos";
import { Members as _Members } from "./members";
import type { MembersAttributes, MembersCreationAttributes } from "./members";
import { Migrations as _Migrations } from "./migrations";
import type { MigrationsAttributes, MigrationsCreationAttributes } from "./migrations";
import { ModelHasPermissions as _ModelHasPermissions } from "./model_has_permissions";
import type { ModelHasPermissionsAttributes, ModelHasPermissionsCreationAttributes } from "./model_has_permissions";
import { ModelHasRoles as _ModelHasRoles } from "./model_has_roles";
import type { ModelHasRolesAttributes, ModelHasRolesCreationAttributes } from "./model_has_roles";
import { PasswordResetTokens as _PasswordResetTokens } from "./password_reset_tokens";
import type { PasswordResetTokensAttributes, PasswordResetTokensCreationAttributes } from "./password_reset_tokens";
import { PasswordResets as _PasswordResets } from "./password_resets";
import type { PasswordResetsAttributes, PasswordResetsCreationAttributes } from "./password_resets";
import { Permissions as _Permissions } from "./permissions";
import type { PermissionsAttributes, PermissionsCreationAttributes } from "./permissions";
import { PersonalAccessTokens as _PersonalAccessTokens } from "./personal_access_tokens";
import type { PersonalAccessTokensAttributes, PersonalAccessTokensCreationAttributes } from "./personal_access_tokens";
import { PlazosConsentracions as _PlazosConsentracions } from "./plazos_consentracions";
import type { PlazosConsentracionsAttributes, PlazosConsentracionsCreationAttributes } from "./plazos_consentracions";
import { Registro as _Registro } from "./registro";
import type { RegistroAttributes, RegistroCreationAttributes } from "./registro";
import { RegistroAtencions as _RegistroAtencions } from "./registro_atencions";
import type { RegistroAtencionsAttributes, RegistroAtencionsCreationAttributes } from "./registro_atencions";
import { RegistroConocimientos as _RegistroConocimientos } from "./registro_conocimientos";
import type { RegistroConocimientosAttributes, RegistroConocimientosCreationAttributes } from "./registro_conocimientos";
import { RegistroDocs as _RegistroDocs } from "./registro_docs";
import type { RegistroDocsAttributes, RegistroDocsCreationAttributes } from "./registro_docs";
import { RegistroFisicos as _RegistroFisicos } from "./registro_fisicos";
import type { RegistroFisicosAttributes, RegistroFisicosCreationAttributes } from "./registro_fisicos";
import { Remitentes as _Remitentes } from "./remitentes";
import type { RemitentesAttributes, RemitentesCreationAttributes } from "./remitentes";
import { ResponsablesArchivos as _ResponsablesArchivos } from "./responsables_archivos";
import type { ResponsablesArchivosAttributes, ResponsablesArchivosCreationAttributes } from "./responsables_archivos";
import { Respuestas as _Respuestas } from "./respuestas";
import type { RespuestasAttributes, RespuestasCreationAttributes } from "./respuestas";
import { RoleHasPermissions as _RoleHasPermissions } from "./role_has_permissions";
import type { RoleHasPermissionsAttributes, RoleHasPermissionsCreationAttributes } from "./role_has_permissions";
import { Roles as _Roles } from "./roles";
import type { RolesAttributes, RolesCreationAttributes } from "./roles";
import { Secciones as _Secciones } from "./secciones";
import type { SeccionesAttributes, SeccionesCreationAttributes } from "./secciones";
import { SeccionesDir as _SeccionesDir } from "./secciones_dir";
import type { SeccionesDirAttributes, SeccionesDirCreationAttributes } from "./secciones_dir";
import { Series as _Series } from "./series";
import type { SeriesAttributes, SeriesCreationAttributes } from "./series";
import { Sessions as _Sessions } from "./sessions";
import type { SessionsAttributes, SessionsCreationAttributes } from "./sessions";
import { SolicitudClasificacions as _SolicitudClasificacions } from "./solicitud_clasificacions";
import type { SolicitudClasificacionsAttributes, SolicitudClasificacionsCreationAttributes } from "./solicitud_clasificacions";
import { SubSeries as _SubSeries } from "./sub_series";
import type { SubSeriesAttributes, SubSeriesCreationAttributes } from "./sub_series";
import { Subfondo as _Subfondo } from "./subfondo";
import type { SubfondoAttributes, SubfondoCreationAttributes } from "./subfondo";
import { SubsubSeries as _SubsubSeries } from "./subsub_series";
import type { SubsubSeriesAttributes, SubsubSeriesCreationAttributes } from "./subsub_series";
import { TecnicasSeleccions as _TecnicasSeleccions } from "./tecnicas_seleccions";
import type { TecnicasSeleccionsAttributes, TecnicasSeleccionsCreationAttributes } from "./tecnicas_seleccions";
import { TipoAtencions as _TipoAtencions } from "./tipo_atencions";
import type { TipoAtencionsAttributes, TipoAtencionsCreationAttributes } from "./tipo_atencions";
import { TipoDocApoyos as _TipoDocApoyos } from "./tipo_doc_apoyos";
import type { TipoDocApoyosAttributes, TipoDocApoyosCreationAttributes } from "./tipo_doc_apoyos";
import { TipoDocSerie as _TipoDocSerie } from "./tipo_doc_serie";
import type { TipoDocSerieAttributes, TipoDocSerieCreationAttributes } from "./tipo_doc_serie";
import { TipoDocSeries as _TipoDocSeries } from "./tipo_doc_series";
import type { TipoDocSeriesAttributes, TipoDocSeriesCreationAttributes } from "./tipo_doc_series";
import { TipoDocs as _TipoDocs } from "./tipo_docs";
import type { TipoDocsAttributes, TipoDocsCreationAttributes } from "./tipo_docs";
import { TipoExpedienteTratamientos as _TipoExpedienteTratamientos } from "./tipo_expediente_tratamientos";
import type { TipoExpedienteTratamientosAttributes, TipoExpedienteTratamientosCreationAttributes } from "./tipo_expediente_tratamientos";
import { TipoExpedientes as _TipoExpedientes } from "./tipo_expedientes";
import type { TipoExpedientesAttributes, TipoExpedientesCreationAttributes } from "./tipo_expedientes";
import { TipoSeccions as _TipoSeccions } from "./tipo_seccions";
import type { TipoSeccionsAttributes, TipoSeccionsCreationAttributes } from "./tipo_seccions";
import { TipoTramiteMovimientos as _TipoTramiteMovimientos } from "./tipo_tramite_movimientos";
import type { TipoTramiteMovimientosAttributes, TipoTramiteMovimientosCreationAttributes } from "./tipo_tramite_movimientos";
import { TipoTramites as _TipoTramites } from "./tipo_tramites";
import type { TipoTramitesAttributes, TipoTramitesCreationAttributes } from "./tipo_tramites";
import { TiposUsuarios as _TiposUsuarios } from "./tipos_usuarios";
import type { TiposUsuariosAttributes, TiposUsuariosCreationAttributes } from "./tipos_usuarios";
import { UsLecturas as _UsLecturas } from "./us_lecturas";
import type { UsLecturasAttributes, UsLecturasCreationAttributes } from "./us_lecturas";
import { Users as _Users } from "./users";
import type { UsersAttributes, UsersCreationAttributes } from "./users";
import { ValorDocumentalSerieSubserie as _ValorDocumentalSerieSubserie } from "./valor_documental_serie_subserie";
import type { ValorDocumentalSerieSubserieAttributes, ValorDocumentalSerieSubserieCreationAttributes } from "./valor_documental_serie_subserie";
import { ValorDocumentals as _ValorDocumentals } from "./valor_documentals";
import type { ValorDocumentalsAttributes, ValorDocumentalsCreationAttributes } from "./valor_documentals";

export {
  _Agendas as Agendas,
  _Answers as Answers,
  _Atencion as Atencion,
  _AtencionDocs as AtencionDocs,
  _Autorizados as Autorizados,
  _AvisosTerminos as AvisosTerminos,
  _BitacoraClasificacions as BitacoraClasificacions,
  _Cache as Cache,
  _CacheLocks as CacheLocks,
  _Comentarios as Comentarios,
  _Comments as Comments,
  _Concentracions as Concentracions,
  _ContenidoExpedientes as ContenidoExpedientes,
  _ControlPermisosDocumentos as ControlPermisosDocumentos,
  _DestinoFinals as DestinoFinals,
  _DocumentosApoyos as DocumentosApoyos,
  _DocumentosEnvios as DocumentosEnvios,
  _ExpedienteSerieSubses as ExpedienteSerieSubses,
  _FailedJobs as FailedJobs,
  _FirmaDocs as FirmaDocs,
  _Folios as Folios,
  _Groups as Groups,
  _InventarioConcentracions as InventarioConcentracions,
  _InventarioFisicos as InventarioFisicos,
  _Members as Members,
  _Migrations as Migrations,
  _ModelHasPermissions as ModelHasPermissions,
  _ModelHasRoles as ModelHasRoles,
  _PasswordResetTokens as PasswordResetTokens,
  _PasswordResets as PasswordResets,
  _Permissions as Permissions,
  _PersonalAccessTokens as PersonalAccessTokens,
  _PlazosConsentracions as PlazosConsentracions,
  _Registro as Registro,
  _RegistroAtencions as RegistroAtencions,
  _RegistroConocimientos as RegistroConocimientos,
  _RegistroDocs as RegistroDocs,
  _RegistroFisicos as RegistroFisicos,
  _Remitentes as Remitentes,
  _ResponsablesArchivos as ResponsablesArchivos,
  _Respuestas as Respuestas,
  _RoleHasPermissions as RoleHasPermissions,
  _Roles as Roles,
  _Secciones as Secciones,
  _SeccionesDir as SeccionesDir,
  _Series as Series,
  _Sessions as Sessions,
  _SolicitudClasificacions as SolicitudClasificacions,
  _SubSeries as SubSeries,
  _Subfondo as Subfondo,
  _SubsubSeries as SubsubSeries,
  _TecnicasSeleccions as TecnicasSeleccions,
  _TipoAtencions as TipoAtencions,
  _TipoDocApoyos as TipoDocApoyos,
  _TipoDocSerie as TipoDocSerie,
  _TipoDocSeries as TipoDocSeries,
  _TipoDocs as TipoDocs,
  _TipoExpedienteTratamientos as TipoExpedienteTratamientos,
  _TipoExpedientes as TipoExpedientes,
  _TipoSeccions as TipoSeccions,
  _TipoTramiteMovimientos as TipoTramiteMovimientos,
  _TipoTramites as TipoTramites,
  _TiposUsuarios as TiposUsuarios,
  _UsLecturas as UsLecturas,
  _Users as Users,
  _ValorDocumentalSerieSubserie as ValorDocumentalSerieSubserie,
  _ValorDocumentals as ValorDocumentals,
};

export type {
  AgendasAttributes,
  AgendasCreationAttributes,
  AnswersAttributes,
  AnswersCreationAttributes,
  AtencionAttributes,
  AtencionCreationAttributes,
  AtencionDocsAttributes,
  AtencionDocsCreationAttributes,
  AutorizadosAttributes,
  AutorizadosCreationAttributes,
  AvisosTerminosAttributes,
  AvisosTerminosCreationAttributes,
  BitacoraClasificacionsAttributes,
  BitacoraClasificacionsCreationAttributes,
  CacheAttributes,
  CacheCreationAttributes,
  CacheLocksAttributes,
  CacheLocksCreationAttributes,
  ComentariosAttributes,
  ComentariosCreationAttributes,
  CommentsAttributes,
  CommentsCreationAttributes,
  ConcentracionsAttributes,
  ConcentracionsCreationAttributes,
  ContenidoExpedientesAttributes,
  ContenidoExpedientesCreationAttributes,
  ControlPermisosDocumentosAttributes,
  ControlPermisosDocumentosCreationAttributes,
  DestinoFinalsAttributes,
  DestinoFinalsCreationAttributes,
  DocumentosApoyosAttributes,
  DocumentosApoyosCreationAttributes,
  DocumentosEnviosAttributes,
  DocumentosEnviosCreationAttributes,
  ExpedienteSerieSubsesAttributes,
  ExpedienteSerieSubsesCreationAttributes,
  FailedJobsAttributes,
  FailedJobsCreationAttributes,
  FirmaDocsAttributes,
  FirmaDocsCreationAttributes,
  FoliosAttributes,
  FoliosCreationAttributes,
  GroupsAttributes,
  GroupsCreationAttributes,
  InventarioConcentracionsAttributes,
  InventarioConcentracionsCreationAttributes,
  InventarioFisicosAttributes,
  InventarioFisicosCreationAttributes,
  MembersAttributes,
  MembersCreationAttributes,
  MigrationsAttributes,
  MigrationsCreationAttributes,
  ModelHasPermissionsAttributes,
  ModelHasPermissionsCreationAttributes,
  ModelHasRolesAttributes,
  ModelHasRolesCreationAttributes,
  PasswordResetTokensAttributes,
  PasswordResetTokensCreationAttributes,
  PasswordResetsAttributes,
  PasswordResetsCreationAttributes,
  PermissionsAttributes,
  PermissionsCreationAttributes,
  PersonalAccessTokensAttributes,
  PersonalAccessTokensCreationAttributes,
  PlazosConsentracionsAttributes,
  PlazosConsentracionsCreationAttributes,
  RegistroAttributes,
  RegistroCreationAttributes,
  RegistroAtencionsAttributes,
  RegistroAtencionsCreationAttributes,
  RegistroConocimientosAttributes,
  RegistroConocimientosCreationAttributes,
  RegistroDocsAttributes,
  RegistroDocsCreationAttributes,
  RegistroFisicosAttributes,
  RegistroFisicosCreationAttributes,
  RemitentesAttributes,
  RemitentesCreationAttributes,
  ResponsablesArchivosAttributes,
  ResponsablesArchivosCreationAttributes,
  RespuestasAttributes,
  RespuestasCreationAttributes,
  RoleHasPermissionsAttributes,
  RoleHasPermissionsCreationAttributes,
  RolesAttributes,
  RolesCreationAttributes,
  SeccionesAttributes,
  SeccionesCreationAttributes,
  SeccionesDirAttributes,
  SeccionesDirCreationAttributes,
  SeriesAttributes,
  SeriesCreationAttributes,
  SessionsAttributes,
  SessionsCreationAttributes,
  SolicitudClasificacionsAttributes,
  SolicitudClasificacionsCreationAttributes,
  SubSeriesAttributes,
  SubSeriesCreationAttributes,
  SubfondoAttributes,
  SubfondoCreationAttributes,
  SubsubSeriesAttributes,
  SubsubSeriesCreationAttributes,
  TecnicasSeleccionsAttributes,
  TecnicasSeleccionsCreationAttributes,
  TipoAtencionsAttributes,
  TipoAtencionsCreationAttributes,
  TipoDocApoyosAttributes,
  TipoDocApoyosCreationAttributes,
  TipoDocSerieAttributes,
  TipoDocSerieCreationAttributes,
  TipoDocSeriesAttributes,
  TipoDocSeriesCreationAttributes,
  TipoDocsAttributes,
  TipoDocsCreationAttributes,
  TipoExpedienteTratamientosAttributes,
  TipoExpedienteTratamientosCreationAttributes,
  TipoExpedientesAttributes,
  TipoExpedientesCreationAttributes,
  TipoSeccionsAttributes,
  TipoSeccionsCreationAttributes,
  TipoTramiteMovimientosAttributes,
  TipoTramiteMovimientosCreationAttributes,
  TipoTramitesAttributes,
  TipoTramitesCreationAttributes,
  TiposUsuariosAttributes,
  TiposUsuariosCreationAttributes,
  UsLecturasAttributes,
  UsLecturasCreationAttributes,
  UsersAttributes,
  UsersCreationAttributes,
  ValorDocumentalSerieSubserieAttributes,
  ValorDocumentalSerieSubserieCreationAttributes,
  ValorDocumentalsAttributes,
  ValorDocumentalsCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Agendas = _Agendas.initModel(sequelize);
  const Answers = _Answers.initModel(sequelize);
  const Atencion = _Atencion.initModel(sequelize);
  const AtencionDocs = _AtencionDocs.initModel(sequelize);
  const Autorizados = _Autorizados.initModel(sequelize);
  const AvisosTerminos = _AvisosTerminos.initModel(sequelize);
  const BitacoraClasificacions = _BitacoraClasificacions.initModel(sequelize);
  const Cache = _Cache.initModel(sequelize);
  const CacheLocks = _CacheLocks.initModel(sequelize);
  const Comentarios = _Comentarios.initModel(sequelize);
  const Comments = _Comments.initModel(sequelize);
  const Concentracions = _Concentracions.initModel(sequelize);
  const ContenidoExpedientes = _ContenidoExpedientes.initModel(sequelize);
  const ControlPermisosDocumentos = _ControlPermisosDocumentos.initModel(sequelize);
  const DestinoFinals = _DestinoFinals.initModel(sequelize);
  const DocumentosApoyos = _DocumentosApoyos.initModel(sequelize);
  const DocumentosEnvios = _DocumentosEnvios.initModel(sequelize);
  const ExpedienteSerieSubses = _ExpedienteSerieSubses.initModel(sequelize);
  const FailedJobs = _FailedJobs.initModel(sequelize);
  const FirmaDocs = _FirmaDocs.initModel(sequelize);
  const Folios = _Folios.initModel(sequelize);
  const Groups = _Groups.initModel(sequelize);
  const InventarioConcentracions = _InventarioConcentracions.initModel(sequelize);
  const InventarioFisicos = _InventarioFisicos.initModel(sequelize);
  const Members = _Members.initModel(sequelize);
  const Migrations = _Migrations.initModel(sequelize);
  const ModelHasPermissions = _ModelHasPermissions.initModel(sequelize);
  const ModelHasRoles = _ModelHasRoles.initModel(sequelize);
  const PasswordResetTokens = _PasswordResetTokens.initModel(sequelize);
  const PasswordResets = _PasswordResets.initModel(sequelize);
  const Permissions = _Permissions.initModel(sequelize);
  const PersonalAccessTokens = _PersonalAccessTokens.initModel(sequelize);
  const PlazosConsentracions = _PlazosConsentracions.initModel(sequelize);
  const Registro = _Registro.initModel(sequelize);
  const RegistroAtencions = _RegistroAtencions.initModel(sequelize);
  const RegistroConocimientos = _RegistroConocimientos.initModel(sequelize);
  const RegistroDocs = _RegistroDocs.initModel(sequelize);
  const RegistroFisicos = _RegistroFisicos.initModel(sequelize);
  const Remitentes = _Remitentes.initModel(sequelize);
  const ResponsablesArchivos = _ResponsablesArchivos.initModel(sequelize);
  const Respuestas = _Respuestas.initModel(sequelize);
  const RoleHasPermissions = _RoleHasPermissions.initModel(sequelize);
  const Roles = _Roles.initModel(sequelize);
  const Secciones = _Secciones.initModel(sequelize);
  const SeccionesDir = _SeccionesDir.initModel(sequelize);
  const Series = _Series.initModel(sequelize);
  const Sessions = _Sessions.initModel(sequelize);
  const SolicitudClasificacions = _SolicitudClasificacions.initModel(sequelize);
  const SubSeries = _SubSeries.initModel(sequelize);
  const Subfondo = _Subfondo.initModel(sequelize);
  const SubsubSeries = _SubsubSeries.initModel(sequelize);
  const TecnicasSeleccions = _TecnicasSeleccions.initModel(sequelize);
  const TipoAtencions = _TipoAtencions.initModel(sequelize);
  const TipoDocApoyos = _TipoDocApoyos.initModel(sequelize);
  const TipoDocSerie = _TipoDocSerie.initModel(sequelize);
  const TipoDocSeries = _TipoDocSeries.initModel(sequelize);
  const TipoDocs = _TipoDocs.initModel(sequelize);
  const TipoExpedienteTratamientos = _TipoExpedienteTratamientos.initModel(sequelize);
  const TipoExpedientes = _TipoExpedientes.initModel(sequelize);
  const TipoSeccions = _TipoSeccions.initModel(sequelize);
  const TipoTramiteMovimientos = _TipoTramiteMovimientos.initModel(sequelize);
  const TipoTramites = _TipoTramites.initModel(sequelize);
  const TiposUsuarios = _TiposUsuarios.initModel(sequelize);
  const UsLecturas = _UsLecturas.initModel(sequelize);
  const Users = _Users.initModel(sequelize);
  const ValorDocumentalSerieSubserie = _ValorDocumentalSerieSubserie.initModel(sequelize);
  const ValorDocumentals = _ValorDocumentals.initModel(sequelize);

  Permissions.belongsToMany(Roles, { as: 'role_id_roles', through: RoleHasPermissions, foreignKey: "permission_id", otherKey: "role_id" });
  Roles.belongsToMany(Permissions, { as: 'permission_id_permissions', through: RoleHasPermissions, foreignKey: "role_id", otherKey: "permission_id" });
  Answers.belongsTo(Comments, { foreignKey: "id_comment"});
  Comments.hasMany(Answers, { foreignKey: "id_comment"});
  ModelHasPermissions.belongsTo(Permissions, { foreignKey: "permission_id"});
  Permissions.hasMany(ModelHasPermissions, { foreignKey: "permission_id"});
  RoleHasPermissions.belongsTo(Permissions, { foreignKey: "permission_id"});
  Permissions.hasMany(RoleHasPermissions, { foreignKey: "permission_id"});
  Agendas.belongsTo(Registro, { foreignKey: "registro_id"});
  Registro.hasMany(Agendas, { foreignKey: "registro_id"});
  Comments.belongsTo(Registro, { foreignKey: "reg_id"});
  Registro.hasMany(Comments, { foreignKey: "reg_id"});
  RegistroAtencions.belongsTo(Registro, { foreignKey: "registro_id"});
  Registro.hasMany(RegistroAtencions, { foreignKey: "registro_id"});
  RegistroConocimientos.belongsTo(Registro, { foreignKey: "registro_id"});
  Registro.hasMany(RegistroConocimientos, { foreignKey: "registro_id"});
  ModelHasRoles.belongsTo(Roles, { foreignKey: "role_id"});
  Roles.hasMany(ModelHasRoles, { foreignKey: "role_id"});
  RoleHasPermissions.belongsTo(Roles, { foreignKey: "role_id"});
  Roles.hasMany(RoleHasPermissions, { foreignKey: "role_id"});

  return {
    Agendas: Agendas,
    Answers: Answers,
    Atencion: Atencion,
    AtencionDocs: AtencionDocs,
    Autorizados: Autorizados,
    AvisosTerminos: AvisosTerminos,
    BitacoraClasificacions: BitacoraClasificacions,
    Cache: Cache,
    CacheLocks: CacheLocks,
    Comentarios: Comentarios,
    Comments: Comments,
    Concentracions: Concentracions,
    ContenidoExpedientes: ContenidoExpedientes,
    ControlPermisosDocumentos: ControlPermisosDocumentos,
    DestinoFinals: DestinoFinals,
    DocumentosApoyos: DocumentosApoyos,
    DocumentosEnvios: DocumentosEnvios,
    ExpedienteSerieSubses: ExpedienteSerieSubses,
    FailedJobs: FailedJobs,
    FirmaDocs: FirmaDocs,
    Folios: Folios,
    Groups: Groups,
    InventarioConcentracions: InventarioConcentracions,
    InventarioFisicos: InventarioFisicos,
    Members: Members,
    Migrations: Migrations,
    ModelHasPermissions: ModelHasPermissions,
    ModelHasRoles: ModelHasRoles,
    PasswordResetTokens: PasswordResetTokens,
    PasswordResets: PasswordResets,
    Permissions: Permissions,
    PersonalAccessTokens: PersonalAccessTokens,
    PlazosConsentracions: PlazosConsentracions,
    Registro: Registro,
    RegistroAtencions: RegistroAtencions,
    RegistroConocimientos: RegistroConocimientos,
    RegistroDocs: RegistroDocs,
    RegistroFisicos: RegistroFisicos,
    Remitentes: Remitentes,
    ResponsablesArchivos: ResponsablesArchivos,
    Respuestas: Respuestas,
    RoleHasPermissions: RoleHasPermissions,
    Roles: Roles,
    Secciones: Secciones,
    SeccionesDir: SeccionesDir,
    Series: Series,
    Sessions: Sessions,
    SolicitudClasificacions: SolicitudClasificacions,
    SubSeries: SubSeries,
    Subfondo: Subfondo,
    SubsubSeries: SubsubSeries,
    TecnicasSeleccions: TecnicasSeleccions,
    TipoAtencions: TipoAtencions,
    TipoDocApoyos: TipoDocApoyos,
    TipoDocSerie: TipoDocSerie,
    TipoDocSeries: TipoDocSeries,
    TipoDocs: TipoDocs,
    TipoExpedienteTratamientos: TipoExpedienteTratamientos,
    TipoExpedientes: TipoExpedientes,
    TipoSeccions: TipoSeccions,
    TipoTramiteMovimientos: TipoTramiteMovimientos,
    TipoTramites: TipoTramites,
    TiposUsuarios: TiposUsuarios,
    UsLecturas: UsLecturas,
    Users: Users,
    ValorDocumentalSerieSubserie: ValorDocumentalSerieSubserie,
    ValorDocumentals: ValorDocumentals,
  };
}
