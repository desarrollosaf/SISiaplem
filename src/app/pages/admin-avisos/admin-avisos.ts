import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisosService, Aviso } from '../../services/avisos.service';

@Component({
  selector: 'app-admin-avisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-avisos.html',
  styleUrl: './admin-avisos.css',
})
export class AdminAvisosComponent implements OnInit {
  private svc = inject(AvisosService);

  avisos = signal<Aviso[]>([]);
  loading = signal(true);
  guardando = signal(false);

  modalMode: 'crear' | 'editar' = 'crear';
  editId: number | null = null;

  form = { titulo: '', descripcion: '', tipo: 'info' as Aviso['tipo'] };
  pdfFile: File | null = null;
  pdfNombre = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.avisos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirCrear() {
    this.modalMode = 'crear';
    this.editId = null;
    this.form = { titulo: '', descripcion: '', tipo: 'info' };
    this.pdfFile = null;
    this.pdfNombre = '';
  }

  abrirEditar(a: Aviso) {
    this.modalMode = 'editar';
    this.editId = a.id;
    this.form = { titulo: a.titulo, descripcion: a.descripcion, tipo: a.tipo };
    this.pdfFile = null;
    this.pdfNombre = a.pdf_path ? a.pdf_path.split('/').pop()! : '';
  }

  onPdfChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.pdfFile = input.files[0];
      this.pdfNombre = this.pdfFile.name;
    }
  }

  guardar() {
    if (!this.form.titulo.trim() || !this.form.descripcion.trim()) return;
    this.guardando.set(true);

    const fd = new FormData();
    fd.append('titulo', this.form.titulo);
    fd.append('descripcion', this.form.descripcion);
    fd.append('tipo', this.form.tipo);
    if (this.pdfFile) fd.append('pdf', this.pdfFile);

    const req = this.modalMode === 'crear'
      ? this.svc.create(fd)
      : this.svc.update(this.editId!, fd);

    req.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargar();
      },
      error: () => this.guardando.set(false),
    });
  }

  cerrarModal() {
    const btn = document.getElementById('btnCerrarModal');
    btn?.click();
  }

  toggleActivo(a: Aviso) {
    this.svc.toggleActivo(a.id).subscribe(() => this.cargar());
  }

  eliminar(a: Aviso) {
    if (!confirm(`¿Eliminar "${a.titulo}"?`)) return;
    this.svc.delete(a.id).subscribe(() => this.cargar());
  }

  pdfUrl(path: string) {
    return this.svc.pdfUrl(path);
  }

  tipoLabel(tipo: string) {
    const map: Record<string, string> = {
      info: 'Información', curso: 'Curso', evento: 'Evento', urgente: 'Urgente',
    };
    return map[tipo] ?? tipo;
  }

  tipoBadge(tipo: string) {
    const map: Record<string, string> = {
      info: 'bg-info', curso: 'bg-success', evento: 'bg-primary', urgente: 'bg-danger',
    };
    return map[tipo] ?? 'bg-secondary';
  }
}
