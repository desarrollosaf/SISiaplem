import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface MultiSelectOption {
  value: number;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-multi-select',
  imports: [FormsModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
})
export class MultiSelectComponent {
  private host = inject(ElementRef);

  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder = 'Escriba para buscar…';
  @Input() emptyLabel = 'Sin opciones disponibles.';

  @Input() value: number[] = [];
  @Output() valueChange = new EventEmitter<number[]>();

  open = signal(false);
  filtro = signal('');

  get seleccionadas(): MultiSelectOption[] {
    return this.options.filter((o) => this.value.includes(o.value));
  }

  // Al escribir filtra por nombre; con la caja vacía muestra todos los que faltan por elegir.
  get disponibles(): MultiSelectOption[] {
    const q = this.filtro().trim().toLowerCase();
    const restantes = this.options.filter((o) => !this.value.includes(o.value));
    if (!q) return restantes;
    return restantes.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  }

  abrir() {
    this.open.set(true);
    this.inputRef?.nativeElement.focus();
  }

  seleccionar(opt: MultiSelectOption) {
    this.value = [...this.value, opt.value];
    this.valueChange.emit(this.value);
    this.filtro.set('');
    this.inputRef?.nativeElement.focus();
  }

  quitar(v: number, ev?: Event) {
    ev?.stopPropagation();
    this.value = this.value.filter((x) => x !== v);
    this.valueChange.emit(this.value);
  }

  // Igual que Gmail/GitHub: si el buscador está vacío, backspace quita el último elegido.
  onBackspace() {
    if (this.filtro() === '' && this.value.length > 0) {
      this.quitar(this.value[this.value.length - 1]);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.host.nativeElement.contains(ev.target)) {
      this.open.set(false);
    }
  }
}
