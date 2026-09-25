import { Component, DestroyRef, Inject, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PermisosService } from '../../core/services/permisos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { HuespedRequest, HuespedResponse } from '../../core/models/huesped.model';
import { textoRequerido } from '../../core/utils/form.validators';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { HuespedService } from '../huesped.service';

@Component({
  selector: 'app-huesped-form',
  standalone: false,
  templateUrl: './huesped-form.component.html',
  styleUrl: './huesped-form.component.scss'
})
export class HuespedFormComponent {
  readonly permisos = inject(PermisosService);
  form: FormGroup;
  guardando = false;
  error = '';
  readonly documentoAnterior: string;
  readonly tiposDocumento = ['INE', 'PASAPORTE'];
  get maxNumeroDocumento(): number {
    return 25 - String(this.form.get('tipoDocumento')?.value ?? '').length - 1;
  }

  constructor(
    fb: FormBuilder,
    private service: HuespedService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HuespedFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HuespedResponse | null
  ) {
    const documento = data?.documento ?? '';
    const partes = /^(INE|PASAPORTE):([A-Z0-9]+)$/i.exec(documento);
    // Los documentos anteriores sin formato se conservan hasta que se elija reemplazarlos.
    this.documentoAnterior = partes ? '' : documento;
    // No se puede separar con certeza un nombre completo que contiene apellidos compuestos.
    // Se pide confirmar los tres campos al editar para no corromper datos existentes.
    this.form = fb.group({
      nombre: ['', textoRequerido(2, 50)],
      apellidoPaterno: ['', textoRequerido(2, 50)],
      apellidoMaterno: ['', textoRequerido(2, 50)],
      email: [data?.email ?? '', [textoRequerido(8, 100), Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
      telefono: [data?.telefono ?? '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      tipoDocumento: [partes?.[1].toUpperCase() ?? '', this.documentoAnterior ? [] : [Validators.required]],
      numeroDocumento: [partes?.[2] ?? ''],
      nacionalidad: [data?.nacionalidad ?? '', textoRequerido(1, 25)]
    });
    this.actualizarValidacionDocumento();
    this.form.get('tipoDocumento')!.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.actualizarValidacionDocumento());
  }

  private actualizarValidacionDocumento(): void {
    const tipo = this.form.get('tipoDocumento')!.value;
    const numero = this.form.get('numeroDocumento')!;
    numero.setValidators(tipo
      ? [textoRequerido(1, this.maxNumeroDocumento), Validators.pattern(/^[a-zA-Z0-9]+$/)]
      : []);
    numero.updateValueAndValidity();
  }

  guardar(): void {
    if (!this.permisos.operar || (this.data && !this.permisos.administrar)) return;
    if (this.guardando) return;
    const valores = this.form.getRawValue();
    for (const campo of Object.keys(valores)) {
      valores[campo] = String(valores[campo] ?? '').trim();
    }
    this.form.patchValue(valores);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { tipoDocumento, numeroDocumento, ...datosHuesped } = this.form.getRawValue();
    if (tipoDocumento && !this.tiposDocumento.includes(tipoDocumento)) return;
    const request: HuespedRequest = {
      ...datosHuesped,
      documento: tipoDocumento
        ? `${tipoDocumento}:${numeroDocumento.toUpperCase()}`
        : this.documentoAnterior
    };
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
        this.snackBar.open(this.data ? 'Huésped actualizado' : 'Huésped registrado', 'Cerrar', { duration: 3000 });
      },
      error: error => this.error = mensajeErrorApi(error, 'No se pudo guardar el huésped. Revisa los datos y que el correo, teléfono o documento no estén registrados.')
    });
  }

  cancelar(): void {
    if (!this.guardando) this.dialogRef.close(false);
  }
}
