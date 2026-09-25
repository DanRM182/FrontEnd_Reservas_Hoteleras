import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioResponse, UsuarioRequest, ROLES_CATALOGO } from '../../core/models/usuario.model';
import { UsuarioService } from '../usuario.service';
import { PermisosService } from '../../core/services/permisos.service';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';

@Component({
  selector: 'app-usuario-form',
  standalone: false,
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {

  guardando = false;
  esEdicion = false;
  form: FormGroup;
  readonly rolesCatalogo = ROLES_CATALOGO;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private permisos: PermisosService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioResponse | null
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      roles: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.esEdicion = true;
      this.form.patchValue({
        username: this.data.username,
        roles: this.data.roles
      });

      this.form.get('username')?.disable();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  guardar(): void {
    if (!this.permisos.administrar || this.guardando) return;
    if (this.esEdicion) {
      this.mostrarMensaje('La edición de usuarios todavía no está disponible.');
      return;
    }
    this.form.patchValue({ username: String(this.form.value.username ?? '').trim() });
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const request: UsuarioRequest = this.form.getRawValue();

    const obs = this.usuarioService.registrar(request);
    this.dialogRef.disableClose = true;

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.dialogRef.close(true);
        this.mostrarMensaje(`Usuario: ${request.username} ${this.esEdicion ? 'actualizado' : 'registrado'}`);
      },
      error: (err) => {
        this.guardando = false;
        this.dialogRef.disableClose = false;
        this.mostrarMensaje(mensajeErrorApi(err, 'Error al guardar el usuario'));
      }
    });
  }

  cancelar(): void {
    if (this.guardando) return;
    this.dialogRef.close(false);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
