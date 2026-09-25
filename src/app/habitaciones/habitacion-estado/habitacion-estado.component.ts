import { Component, Inject, inject } from '@angular/core';
import { PermisosService } from '../../core/services/permisos.service';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ESTADOS_HABITACION, EstadoHabitacionId, HabitacionResponse, obtenerEstadoHabitacionId, puedeCambiarEstado, estaOcupada } from '../../core/models/habitacion.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { HabitacionService } from '../habitacion.service';

@Component({
  selector: 'app-habitacion-estado',
  standalone: false,
  templateUrl: './habitacion-estado.component.html',
  styleUrl: './habitacion-estado.component.scss'
})
export class HabitacionEstadoComponent {
  readonly permisos = inject(PermisosService);
  estado: FormControl<EstadoHabitacionId | null>;
  readonly estados = ESTADOS_HABITACION;
  readonly estaOcupada = estaOcupada;
  guardando = false;
  error = '';

  constructor(
    private service: HabitacionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HabitacionEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HabitacionResponse
  ) {
    this.estado = new FormControl<EstadoHabitacionId | null>(obtenerEstadoHabitacionId(data.estadoHabitacion), Validators.required);
  }

  permitido(idEstado: EstadoHabitacionId | null): boolean {
    return puedeCambiarEstado(this.data, idEstado);
  }

  guardar(): void {
    if (!this.permisos.administrar) return;
    const idEstado = this.estado.value;
    if (this.guardando || this.estado.invalid || idEstado === null || !this.permitido(idEstado)) return;
    this.guardando = true;
    this.dialogRef.disableClose = true;
    this.error = '';
    this.service.actualizarEstado(this.data.id, idEstado).pipe(finalize(() => {
      this.guardando = false;
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 3000 });
      },
      error: error => this.error = mensajeErrorApi(error, 'No se pudo cambiar el estado de la habitación.')
    });
  }
}
