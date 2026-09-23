import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { HabitacionResponse, estaOcupada } from '../../core/models/habitacion.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { HabitacionService } from '../habitacion.service';
import { HabitacionFormComponent } from '../habitacion-form/habitacion-form.component';
import { HabitacionEstadoComponent } from '../habitacion-estado/habitacion-estado.component';

@Component({
  selector: 'app-habitacion-list',
  standalone: false,
  templateUrl: './habitacion-list.component.html',
  styleUrl: './habitacion-list.component.scss'
})
export class HabitacionListComponent implements OnInit {
  registros: HabitacionResponse[] = [];
  columnas = ['numeroHabitacion', 'tipoHabitacion', 'precio', 'capacidad', 'estadoHabitacion', 'acciones'];
  readonly estaOcupada = estaOcupada;
  cargando = false;
  eliminandoId: number | null = null;
  error = '';

  constructor(
    private service: HabitacionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.buscar(); }

  buscar(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    this.service.listar().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.registros = data,
      error: error => this.error = mensajeErrorApi(error, 'No se pudo cargar el listado de habitaciones.')
    });
  }

  abrirFormulario(registro?: HabitacionResponse): void {
    if (registro && estaOcupada(registro)) return;
    const ref = this.dialog.open(HabitacionFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: registro ?? null
    });
    ref.afterClosed().subscribe(guardado => { if (guardado) this.buscar(); });
  }

  cambiarEstado(registro: HabitacionResponse): void {
    const ref = this.dialog.open(HabitacionEstadoComponent, { width: '450px', maxWidth: '95vw', data: registro });
    ref.afterClosed().subscribe(guardado => { if (guardado) this.buscar(); });
  }

  eliminar(registro: HabitacionResponse): void {
    if (this.eliminandoId !== null || estaOcupada(registro)) return;
    if (!confirm(`¿Eliminar habitación "${registro.numeroHabitacion}"? Dejará de aparecer en el listado de registros activos.`)) return;
    this.eliminandoId = registro.id;
    this.service.eliminar(registro.id).pipe(finalize(() => this.eliminandoId = null)).subscribe({
      next: () => {
        this.snackBar.open('Habitación eliminada', 'Cerrar', { duration: 3000 });
        this.buscar();
      },
      error: error => this.snackBar.open(mensajeErrorApi(error, 'No se pudo eliminar habitación.'), 'Cerrar', { duration: 5000 })
    });
  }
}
