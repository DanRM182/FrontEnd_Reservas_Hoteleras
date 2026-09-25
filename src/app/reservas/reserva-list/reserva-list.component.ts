import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermisosService } from '../../core/services/permisos.service';
import { ReservaFormComponent } from '../reserva-form/reserva-form.component';
import { finalize } from 'rxjs';
import { ReservaResponse, EstadoReservaId, puedeTransicionar, puedeEditarReserva, puedeEliminarReserva } from '../../core/models/reserva.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { ReservaService } from '../reserva.service';

@Component({
  selector: 'app-reserva-list',
  standalone: false,
  templateUrl: './reserva-list.component.html',
  styleUrl: './reserva-list.component.scss'
})
export class ReservaListComponent implements OnInit {
  registros: ReservaResponse[] = [];
  columnas = ['id', 'huesped', 'habitacion', 'fechaEntrada', 'fechaSalida', 'estadoReserva', 'acciones'];
  readonly puedeTransicionar = puedeTransicionar;
  readonly puedeEditar = puedeEditarReserva;
  readonly puedeEliminar = puedeEliminarReserva;
  procesando = false;
  cargando = false;
  error = '';
  errorOperacion = '';

  constructor(private service: ReservaService, public permisos: PermisosService, private dialog: MatDialog, private snackBar: MatSnackBar) {}
  ngOnInit(): void { this.buscar(); }

  buscar(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    this.service.listar().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => { this.registros = data; this.errorOperacion = ''; },
      error: error => this.error = mensajeErrorApi(error, 'No se pudieron consultar las reservaciones.')
    });
  }

  abrirFormulario(reserva?: ReservaResponse): void {
    if (!this.permisos.operar || this.procesando || this.errorOperacion || (reserva && !puedeEditarReserva(reserva))) return;
    this.dialog.open(ReservaFormComponent, { width: '600px', maxWidth: '95vw', data: reserva ?? null })
      .afterClosed().subscribe(guardado => { if (guardado) this.buscar(); });
  }

  cambiarEstado(reserva: ReservaResponse, destino: EstadoReservaId): void {
    if (!this.permisos.operar || this.procesando || this.errorOperacion || !puedeTransicionar(reserva, destino)) return;
    const accion = destino === 2 ? 'realizar el check-in' : destino === 3 ? 'realizar el check-out' : 'cancelar';
    if (!confirm(`¿Confirmas ${accion} de la reserva ${reserva.id}?`)) return;
    this.procesando = true;
    this.service.actualizarEstado(reserva.id, destino).pipe(finalize(() => this.procesando = false)).subscribe({
      next: () => { this.snackBar.open('Reserva actualizada', 'Cerrar', { duration: 3000 }); this.buscar(); },
      error: error => this.informarFallo(error)
    });
  }

  eliminar(reserva: ReservaResponse): void {
    if (!this.permisos.administrar || this.procesando || this.errorOperacion || !puedeEliminarReserva(reserva)) return;
    if (!confirm(`¿Eliminar la reserva ${reserva.id}? Dejará de aparecer en los registros activos.`)) return;
    this.procesando = true;
    this.service.eliminar(reserva.id).pipe(finalize(() => this.procesando = false)).subscribe({
      next: () => { this.snackBar.open('Reserva eliminada', 'Cerrar', { duration: 3000 }); this.buscar(); },
      error: error => this.informarFallo(error)
    });
  }

  private informarFallo(error: unknown): void {
    this.errorOperacion = error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)
      ? 'No se pudo confirmar la operación de la reserva. Actualiza el listado para consultar su estado antes de volver a intentarlo. Si el error persiste, contacta al administrador.'
      : mensajeErrorApi(error, 'No se pudo actualizar la reserva. Actualiza el listado.');
  }
}
