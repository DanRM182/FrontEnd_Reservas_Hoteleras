import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, map, throwError } from 'rxjs';
import { PermisosService } from '../core/services/permisos.service';
import { HabitacionService } from '../habitaciones/habitacion.service';
import { HuespedService } from '../huespedes/huesped.service';
import { ReservaService } from '../reservas/reserva.service';

export interface GrupoReporte { estado: string; total: number; }
export interface Reporte {
  habitaciones: GrupoReporte[];
  reservas: GrupoReporte[];
  totalHabitaciones: number;
  totalHuespedes: number;
  totalReservas: number;
  actualizado: Date;
}
export function agruparEstados(estados: string[]): GrupoReporte[] {
  const grupos = new Map<string, number>();
  for (const estado of estados) grupos.set(estado, (grupos.get(estado) ?? 0) + 1);
  return Array.from(grupos, ([estado, total]) => ({ estado, total }));
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private permisos: PermisosService, private habitaciones: HabitacionService, private huespedes: HuespedService, private reservas: ReservaService) {}
  obtener() {
    if (!this.permisos.administrar) return throwError(() => new HttpErrorResponse({ status: 403 }));
    return forkJoin({ habitaciones: this.habitaciones.listar(), huespedes: this.huespedes.listar(), reservas: this.reservas.listar() }).pipe(
      map(({ habitaciones, huespedes, reservas }): Reporte => ({
        habitaciones: agruparEstados(habitaciones.map(h => h.estadoHabitacion)),
        reservas: agruparEstados(reservas.map(r => r.estadoReserva)),
        totalHabitaciones: habitaciones.length, totalHuespedes: huespedes.length, totalReservas: reservas.length, actualizado: new Date()
      }))
    );
  }
}
