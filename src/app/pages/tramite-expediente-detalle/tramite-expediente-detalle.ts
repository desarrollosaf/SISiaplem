import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GuiaService, ExpedienteDetalle, TipoTratamiento, ServidorPublico, addDoc, TipoDocumental } from '../../services/guia.service';
import { SearchableSelectComponent, SearchableOption } from '../../components/searchable-select/searchable-select';
import { sign } from 'crypto';

@Component({
  selector: 'app-tramite-expediente-detalle',
  imports: [RouterLink, FormsModule, NgClass, SearchableSelectComponent, ReactiveFormsModule],
  templateUrl: './tramite-expediente-detalle.html',
  styleUrl: './tramite-expediente-detalle.css',
})
export class TramiteExpedienteDetalleComponent implements OnInit {
  detalle = signal<ExpedienteDetalle | null>(null);
  cargando = signal(true);
  error = signal('');
  documentoError = signal('');
  add = signal<addDoc | null>(null);

  tiposTratamiento = signal<TipoTratamiento[]>([]);
  tipoDocumento = signal<TipoDocumental[]>([]);
  servidoresPublicos = signal<ServidorPublico[]>([]);
  drawerOpen = signal(false);
  drawerOpenAdd = signal(false);
  guardando = signal(false);
  guardandoAdd = signal(false);
  detalleAdd = signal<addDoc | null>(null);
  archivoSeleccionado: File | null = null;

  servidoresOptions = computed<SearchableOption[]>(() =>
    this.servidoresPublicos().map((sp) => ({ value: sp.N_Usuario, label: sp.Nombre, sublabel: sp.N_Usuario })),
  );

  tab = signal<'digital' | 'fisico'>('digital');
  busca = signal('');
  expandidos = signal<Set<number>>(new Set());

  totalDigital = computed(() => (this.detalle()?.digitales.length ?? 0) + (this.detalle()?.registrosDocs.length ?? 0));
  totalFisico = computed(() => this.detalle()?.fisicos.length ?? 0);

  // Orden natural/numérico por folio (ej. 48001/2/2026 antes que 48001/13/2026)
  private compararFolio(a: string | null, b: string | null): number {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const partesA = a.match(/\d+|\D+/g) ?? [a];
    const partesB = b.match(/\d+|\D+/g) ?? [b];
    const len = Math.max(partesA.length, partesB.length);
    for (let i = 0; i < len; i++) {
      const va = partesA[i] ?? '';
      const vb = partesB[i] ?? '';
      const na = Number(va);
      const nb = Number(vb);
      if (va !== '' && vb !== '' && !isNaN(na) && !isNaN(nb)) {
        if (na !== nb) return na - nb;
      } else if (va !== vb) {
        return va < vb ? -1 : 1;
      }
    }
    return 0;
  }

  fisicosFiltrados = computed(() => {
    const q = this.busca().trim().toLowerCase();
    const lista = this.detalle()?.fisicos ?? [];
    const filtrados = q ? lista.filter((f) => f.folio?.toLowerCase().includes(q) || f.titulo_doc?.toLowerCase().includes(q)) : lista;
    return [...filtrados].sort((a, b) => this.compararFolio(a.folio, b.folio));
  });

  // Cada Registro digital es su propia carpeta expandible (con sus documentos_envios anidados)
  digitalesFiltrados = computed(() => {
    const q = this.busca().trim().toLowerCase();
    const lista = this.detalle()?.digitales ?? [];
    const filtrados = q ? lista.filter((d) => d.folio?.toLowerCase().includes(q) || d.titulo_doc?.toLowerCase().includes(q)) : lista;
    return [...filtrados].sort((a, b) => this.compararFolio(a.folio, b.folio));
  });

  // registro_docs se muestra plano, sin agrupar (igual que el sistema anterior)
  registrosDocsFiltrados = computed(() => {
    const q = this.busca().trim().toLowerCase();
    const lista = this.detalle()?.registrosDocs ?? [];
    const filtrados = q ? lista.filter((d) => d.folio?.toLowerCase().includes(q) || d.titulo_doc?.toLowerCase().includes(q)) : lista;
    return [...filtrados].sort((a, b) => this.compararFolio(a.folio, b.folio));
  });

  editNombre = '';
  editAnio = '';
  editTipoExpediente: number | 0 = 0;
  asignacionDirecta = false;
  editResponsable: string | null = null;

  private id = 0;
  formularioAdd: FormGroup; 

  constructor(
    private route: ActivatedRoute,
    private guia: GuiaService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.formularioAdd = this.fb.group({
      folio: ['', Validators.required],
      fecha_recepcion: ['', Validators.required],
      fecha_documento: ['', Validators.required],
      tipo_documento: [null, Validators.required],
      descripcion_doc: [''],
      path: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.guia.getTiposTratamiento().subscribe({ next: (data) => this.tiposTratamiento.set(data), error: (e) => console.error(e) });
    this.guia.getServidoresPublicos().subscribe({ next: (data) => this.servidoresPublicos.set(data), error: (e) => console.error(e) });

    // Angular reutiliza el componente al pasar de un expediente a otro (p. ej. desde la búsqueda global)
    this.route.paramMap.subscribe((params) => {
      this.id = +(params.get('id') ?? 0);
      this.busca.set('');
      this.expandidos.set(new Set());
      this.cargar();
      this.guia.getTipoDocumental(this.id).subscribe({
        next: (data) => {
          this.tipoDocumento.set(data);
          if (data.length > 0) {
            this.formularioAdd.get('tipo_documento')?.setValue(0);
          }
        },
        error: (e) => console.error(e),
      });
    });
  }

  private cargar() {
    this.cargando.set(true);
    this.guia.getExpedienteDetalle(this.id).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.cargando.set(false);
        this.tab.set(data.digitales.length + data.registrosDocs.length > 0 ? 'digital' : 'fisico');
      },
      error: (e) => {
        this.error.set('No se pudo cargar el expediente. Verifica que el backend esté corriendo.');
        this.cargando.set(false);
        console.error(e);
      },
    });
  }

  cambiarTab(t: 'digital' | 'fisico') {
    this.tab.set(t);
    this.busca.set('');
  }

  toggleGrupo(registroId: number) {
    this.expandidos.update((set) => {
      const nuevo = new Set(set);
      if (nuevo.has(registroId)) nuevo.delete(registroId);
      else nuevo.add(registroId);
      return nuevo;
    });
  }

  estaExpandido(registroId: number): boolean {
    return this.expandidos().has(registroId);
  }

  iconoArchivo(nombre: string | null): string {
    const ext = (nombre ?? '').split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'bi-file-earmark-pdf-fill icon-pdf';
    if (['doc', 'docx'].includes(ext)) return 'bi-file-earmark-word-fill icon-word';
    if (['xls', 'xlsx'].includes(ext)) return 'bi-file-earmark-excel-fill icon-excel';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'bi-file-earmark-image-fill icon-image';
    return 'bi-file-earmark-fill icon-default';
  }

  abrirDrawer() {
    const d = this.detalle();
    if (!d) return;
    this.editNombre = d.expediente.nombre_ex;
    this.editAnio = d.expediente.anio;
    this.editTipoExpediente = d.expediente.id_tipo_expediente ?? 0;
    this.asignacionDirecta = !!d.expediente.rfc_usuario_expediente;
    this.editResponsable = d.expediente.rfc_usuario_expediente ?? null;
    this.drawerOpen.set(true);
  }

  cerrarDrawer() {
    this.drawerOpen.set(false);
  }

  get formularioValido(): boolean {
    if (!this.editNombre.trim() || !this.editAnio || !this.editTipoExpediente) return false;
    if (this.asignacionDirecta && !this.editResponsable) return false;
    return true;
  }



  guardarTransferencia() {
    if (!this.formularioValido) return;
    this.guardando.set(true);
    this.guia.transferirExpediente(this.id, {
      nombre_ex: this.editNombre.trim(),
      anio: this.editAnio,
      id_tipo_expediente: this.editTipoExpediente || null,
      rfc_usuario_expediente: this.asignacionDirecta ? this.editResponsable : null,
    }).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.guardando.set(false);
        this.drawerOpen.set(false);
      },
      error: (e) => { this.guardando.set(false); console.error(e); },
    });
  }

  descargarDocumento(url: string) {
    this.documentoError.set('');
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank');
      },
      error: () => {
        this.documentoError.set('Archivo no disponible en este entorno.');
      },
    });
  }
  
  

  descargarRegistroDoc(id: number) {
    this.descargarDocumento(this.guia.getDocumentoUrl(id));
  }

  descargarRegistroDocFisico(id: number) {
    this.descargarDocumento(this.guia.getDocumentoUrlFisico(id));
  }

  descargarDocumentoEnvio(id: number) {
    this.descargarDocumento(this.guia.getDocumentoEnvioUrl(id));
  }

  verIndice(tipo: 'fisico' | 'electronico') {
    window.open(this.guia.getIndiceUrl(this.id, tipo), '_blank');
  }

  abrirDrawerAdd() {
    const d = this.detalle();
    if (!d) return;
    this.drawerOpenAdd.set(true);
  }

   cerrarDrawerAdd() {
    this.drawerOpenAdd.set(false);
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];

      this.formularioAdd.get('path')?.setValue(  this.archivoSeleccionado);
      this.formularioAdd.get('path')?.updateValueAndValidity();

      console.log(this.archivoSeleccionado);
    }
  }

  get formularioAddValido(): boolean {
      return this.formularioAdd?.valid ?? false;
  }

   guardarAdd() {
    if (this.formularioAdd.invalid) {
      this.formularioAdd.markAllAsTouched();

      console.log('Formulario inválido');
      return;
  }

    this.guardandoAdd.set(true);
    const datos = this.formularioAdd.getRawValue();
    const formData = new FormData();

    Object.entries(datos).forEach(([key, value]) => {
    if (key !== 'path' && value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

   // Agregar el documento
  if (this.archivoSeleccionado) {
    formData.append(
      'path',
      this.archivoSeleccionado,
      this.archivoSeleccionado.name
    );
  }

    this.guia.addDocExpediente(this.id, formData).subscribe({
      next: (data) => {
        this.detalleAdd.set(data);
        this.guardandoAdd.set(false);
        this.drawerOpenAdd.set(false);
        this.formularioAdd.reset();
        this.cargar();
      },
      error: (e) => { 
        this.guardandoAdd.set(false);
       
        console.error(e);
      },
    });
  }
}
