import { DestroyRef, Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Licencia } from '../interfaces/Licencia';
import { sucursalInicial } from '../auth/auth.service';

const CLAVE = 'sucursal_activa';

/**
 * Sucursal activa de la sesión. Se elige en la barra superior y la usan el dashboard y todos los reportes.
 * Se guarda en localStorage (se borra al cerrar sesión) y siempre se valida contra las licencias del login.
 */
@Injectable({ providedIn: 'root' })
export class SucursalService {
  // Emite solo cuando el usuario cambia de sucursal (no al iniciar), para que cada pantalla recargue lo suyo.
  readonly cambios$ = new Subject<number>();

  get licencias(): Licencia[] {
    try {
      return JSON.parse(localStorage.getItem('licencias') || '[]');
    } catch {
      return [];
    }
  }

  get activa(): number {
    return sucursalInicial();
  }

  seleccionar(sucursal: number | string) {
    const n = Number(sucursal);
    if (!this.licencias.some((l) => Number(l.sucursal) === n) || n === this.activa) return;
    localStorage.setItem(CLAVE, String(n));
    this.cambios$.next(n);
  }
}

/** Llamar en un inicializador de campo (contexto de inyección): se desuscribe sola al destruir el componente. */
export function alCambiarSucursal(fn: (sucursal: number) => void) {
  const sub = inject(SucursalService).cambios$.subscribe(fn);
  inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  return sub;
}
