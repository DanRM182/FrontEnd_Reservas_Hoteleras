import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioResponse, ROLES, ROL_LABELS, Rol } from '../../core/models/usuario.model';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';
import { UsuarioService } from '../usuario.service';
import { PermisosService } from '../../core/services/permisos.service';
import { AuthService } from '../../core/services/auth.service';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';

@Component({
  selector: 'app-usuario-list',
  standalone: false,
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {

  columnas = ['username', 'roles', 'acciones'];
  usuarios: UsuarioResponse[] = [];
  cargando = false;
  eliminando = false;

  readonly rolAdmin = ROLES[0];
  readonly rolLabels = ROL_LABELS;

  constructor(
    private usuarioService: UsuarioService,
    public permisos: PermisosService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.buscar();
  }

  getRolLabel(rol: Rol): string { return this.rolLabels[rol]; }

  buscar(): void {
    this.cargando = true;
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar la lista de usuarios');
        this.cargando = false;
      }
    });
  }

  abrirFormulario(usuario?: UsuarioResponse): void {
    if (!this.permisos.administrar || usuario || this.eliminando) return;
    const ref = this.dialog.open(UsuarioFormComponent, {
      width: '450px',
      data: usuario ?? null
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscar();
    });
  }

  eliminar(usuario: UsuarioResponse): void {
    if (!this.permisos.administrar || this.eliminando) return;
    if (!confirm(`¿Eliminar al usuario "${usuario.username}"?`)) return;

    this.eliminando = true;
    this.usuarioService.eliminar(usuario.username).subscribe({
      next: () => {
        this.eliminando = false;
        if (usuario.username === this.authService.getUsername()) { this.authService.logout(); return; }
        this.mostrarMensaje('Usuario eliminado correctamente');
        this.buscar();
      },
      error: error => { this.eliminando = false; this.mostrarMensaje(mensajeErrorApi(error, 'Error al eliminar el usuario')); }
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
