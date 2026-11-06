import { signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserWithRoles } from '../../services/auth.service';

/** Buscador en vivo de usuarios de SAF (RFC/nombre/correo), reutilizable por campo. */
export class BuscadorUsuarios {
  query = signal('');
  resultados = signal<UserWithRoles[]>([]);
  open = signal(false);
  buscando = signal(false);
  private query$ = new Subject<string>();

  constructor(searchFn: (q: string) => Observable<UserWithRoles[]>) {
    this.query$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < 2) {
            this.buscando.set(false);
            return [] as UserWithRoles[][];
          }
          this.buscando.set(true);
          return searchFn(q);
        }),
      )
      .subscribe({
        next: (data) => {
          this.resultados.set(data);
          this.buscando.set(false);
        },
        error: () => this.buscando.set(false),
      });
  }

  escribir(value: string) {
    this.query.set(value);
    this.open.set(true);
    this.query$.next(value);
  }

  abrir() { this.open.set(true); }
  cerrar() { this.open.set(false); }

  establecer(nombre: string | null, rfc: string) {
    this.query.set(nombre ? `${nombre} (${rfc})` : rfc);
    this.resultados.set([]);
    this.open.set(false);
  }

  limpiar() {
    this.query.set('');
    this.resultados.set([]);
  }
}
