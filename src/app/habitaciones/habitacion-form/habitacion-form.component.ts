import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { HabitacionRequest, HabitacionResponse, TIPOS_HABITACION, obtenerTipoHabitacionId, estaOcupada } from '../../core/models/habitacion.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { HabitacionService } from '../habitacion.service';

@Component({
  selector: 'app-habitacion-form',
  standalone: false,
  templateUrl: './habitacion-form.component.html',
  styleUrl: './habitacion-form.component.scss'
})
export class HabitacionFormComponent {
  form: FormGroup;
  guardando = false;
  error = '';
  readonly tipos = TIPOS_HABITACION;

  constructor(
    fb: FormBuilder,
    private service: HabitacionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HabitacionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HabitacionResponse | null
  ) {
    this.form = fb.group({
      numeroHabitacion: [data?.numeroHabitacion ?? '', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[1-9][0-9]*[A-Z]?$/)]],
      idTipoHabitacion: [data ? obtenerTipoHabitacionId(data.tipoHabitacion) : 1, Validators.required],
      precio: [data?.precio ?? null, [Validators.required, Validators.min(0.01), Validators.max(99999999.99), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      capacidad: [data?.capacidad ?? null, [Validators.required, Validators.min(1), Validators.max(2147483647), Validators.pattern(/^[0-9]+$/)]]
    });
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.data && estaOcupada(this.data)) {
      this.error = 'No se puede editar una habitación ocupada.';
      return;
    }
    this.form.patchValue({ numeroHabitacion: String(this.form.value.numeroHabitacion ?? '').trim().toUpperCase() });
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: HabitacionRequest = this.form.getRawValue();
    this.guardando = true;
    this.dialogRef.disableClose = true;
    this.error = '';
    const operacion = this.data ? this.service.actualizar(this.data.id, request) : this.service.registrar(request);
    operacion.pipe(finalize(() => {
      this.guardando = false;
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.snackBar.open(this.data ? 'Habitación actualizada' : 'Habitación registrada', 'Cerrar', { duration: 3000 });
      },
      error: error => this.error = mensajeErrorApi(error, 'No se pudo guardar la habitación. Revisa los datos y que el número no esté registrado.')
    });
  }

  cancelar(): void {
    if (!this.guardando) this.dialogRef.close(false);
  }
}
