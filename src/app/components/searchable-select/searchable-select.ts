import { Component, ElementRef, HostListener, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-searchable-select',
  imports: [FormsModule],
  templateUrl: './searchable-select.html',
  styleUrl: './searchable-select.css',
})
export class SearchableSelectComponent {
  private host = inject(ElementRef);

  @Input() options: SearchableOption[] = [];
  @Input() placeholder = 'Buscar…';
  @Input() emptyLabel = '— Seleccione una opción —';

  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string | null>();

  open = signal(false);
  filtro = signal('');

  filtradas = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  });

  get seleccionada(): SearchableOption | undefined {
    return this.options.find((o) => o.value === this.value);
  }

  abrir() {
    this.open.set(true);
    this.filtro.set('');
  }

  seleccionar(opt: SearchableOption) {
    this.value = opt.value;
    this.valueChange.emit(opt.value);
    this.open.set(false);
  }

  limpiar(ev: Event) {
    ev.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
    this.filtro.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.open.set(false);
    }
  }
}
