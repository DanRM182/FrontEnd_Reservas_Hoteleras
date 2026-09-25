import { Component, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of, finalize } from 'rxjs';
import { ReservaService } from '../reserva.service';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { HuespedService } from '../../huespedes/huesped.service';
import { PermisosService } from '../../core/services/permisos.service';
import { HabitacionResponse } from '../../core/models/habitacion.model';
import { HuespedResponse } from '../../core/models/huesped.model';
import { ReservaRequest, ReservaResponse, estadoReservaId, puedeEditarReserva, resolverIdHuesped } from '../../core/models/reserva.model';
import { fechaApiAInput, fechaInputAApi, hoyLocal, errorFechas } from '../../core/utils/fecha.helper';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';

@Component({
  selector: 'app-reserva-form',
  standalone: false,
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.scss'
})
export class ReservaFormComponent {
  form: FormGroup;
  habitaciones: HabitacionResponse[] = [];
  huespedes: HuespedResponse[] = [];
  reserva: ReservaResponse | null = null;
  cargando = false;
  guardando = false;
  error = '';
  bloqueo = '';
  enCurso = false;
  get hoy(): string { return hoyLocal(); }

  constructor(
    fb: FormBuilder,
    private service: ReservaService,
    private habitacionService: HabitacionService,
    private huespedService: HuespedService,
    public permisos: PermisosService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ReservaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReservaResponse | null
  ) {
    this.form = fb.group({
      idHabitacion: [null, [Validators.required, Validators.min(1)]],
      idHuesped: [null, [Validators.required, Validators.min(1)]],
      fechaEntrada: [hoyLocal(), Validators.required],
      fechaSalida: ['', Validators.required]
    });
    this.cargar();
  }

  cargar(): void {
    if (this.cargando || this.guardando || !this.permisos.operar) return;
    this.cargando = true;
    this.error = '';
    this.bloqueo = '';
    forkJoin({
      huespedes: this.huespedService.listar(),
      habitaciones: this.data ? of([] as HabitacionResponse[]) : this.habitacionService.listar(),
      reserva: this.data ? this.service.obtenerPorId(this.data.id) : of(null)
    }).pipe(finalize(() => this.cargando = false)).subscribe({
      next: ({ huespedes, habitaciones, reserva }) => {
        this.huespedes = huespedes;
        this.habitaciones = habitaciones.filter(h => h.estadoHabitacion === 'Disponible');
        this.reserva = reserva;
        if (reserva) {
          this.enCurso = estadoReservaId(reserva) === 2;
          const idHuesped = resolverIdHuesped(reserva, huespedes);
          this.form.patchValue({
            idHabitacion: reserva.habitacion?.id ?? null,
            idHuesped,
            fechaEntrada: fechaApiAInput(reserva.fechaEntrada),
            fechaSalida: fechaApiAInput(reserva.fechaSalida)
          });
          this.form.get('idHabitacion')?.disable();
          this.form.get('idHuesped')?.disable();
          if (this.enCurso) this.form.get('fechaEntrada')?.disable();
          else this.form.get('fechaEntrada')?.enable();
          if (!puedeEditarReserva(reserva)) this.bloqueo = 'Esta reserva ya no permite modificar fechas.';
          else if (!idHuesped || !reserva.habitacion?.id) this.bloqueo = 'No se pudo identificar de forma única al huésped o la habitación. Verifica sus registros antes de editar la reserva.';
        } else if (!huespedes.length || !this.habitaciones.length) {
          this.bloqueo = 'Necesitas un huésped registrado y una habitación disponible para crear una reserva.';
        }
      },
      error: error => {
        this.error = mensajeErrorApi(error, 'No se pudieron cargar los datos de la reserva.');
        this.bloqueo = 'Actualiza los datos para continuar.';
      }
    });
  }

  guardar(): void {
    if (!this.permisos.operar || this.cargando || this.guardando || this.bloqueo) return;
    const valores = this.form.getRawValue();
    this.error = errorFechas(valores.fechaEntrada, valores.fechaSalida, this.enCurso);
    if (this.form.invalid || this.error) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.reserva && (!puedeEditarReserva(this.reserva) ||
        valores.idHabitacion !== this.reserva.habitacion?.id ||
        valores.idHuesped !== resolverIdHuesped(this.reserva, this.huespedes) ||
        (this.enCurso && valores.fechaEntrada !== fechaApiAInput(this.reserva.fechaEntrada)))) return;
    if (!this.reserva && (!this.habitaciones.some(h => h.id === valores.idHabitacion) ||
        !this.huespedes.some(h => h.id === valores.idHuesped))) return;
    const request: ReservaRequest = {
      idHabitacion: valores.idHabitacion, idHuesped: valores.idHuesped,
      fechaEntrada: fechaInputAApi(valores.fechaEntrada), fechaSalida: fechaInputAApi(valores.fechaSalida)
    };
    this.guardando = true;
    this.dialogRef.disableClose = true;
    const operacion = this.reserva ? this.service.actualizar(this.reserva.id, request) : this.service.registrar(request);
    operacion.pipe(finalize(() => {
      this.guardando = false;
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.snackBar.open(this.reserva ? 'Fechas actualizadas' : 'Reserva registrada', 'Cerrar', { duration: 3000 });
      },
      error: error => {
        this.error = mensajeErrorApi(error, 'No se pudo guardar la reserva. Actualiza la disponibilidad e intenta nuevamente.');
        if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
          this.bloqueo = 'No se pudo confirmar el guardado. Consulta el listado de reservas antes de volver a registrarla.';
        }
      }
    });
  }
}
