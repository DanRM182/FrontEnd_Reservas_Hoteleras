import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermisosService {
  constructor(private auth: AuthService) {}

  get operar(): boolean { return this.auth.hasAnyRole(['ROLE_ADMIN', 'ROLE_USER']); }
  get administrar(): boolean { return this.auth.isAdmin(); }

  permiteSolicitud(url: string, metodo: string): boolean {
    if (url.startsWith('/auth-api/admin/')) return this.administrar;
    if (!url.startsWith('/api/')) return true;
    if (!this.operar) return false;
    if (metodo === 'GET' || metodo === 'OPTIONS') return true;
    if (/^\/api\/habitaciones(?:\/|$)/.test(url)) return this.administrar;
    if (/^\/api\/huespedes(?:\/|$)/.test(url)) return metodo === 'POST' || this.administrar;
    if (/^\/api\/reservas(?:\/|$)/.test(url)) return metodo !== 'DELETE' || this.administrar;
    return this.administrar;
  }
}
