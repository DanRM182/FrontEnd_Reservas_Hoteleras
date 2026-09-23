import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { HuespedResponse } from '../../core/models/huesped.model';
import { mensajeErrorApi } from '../../core/utils/api-error.helper';
import { HuespedService } from '../huesped.service';
import { HuespedFormComponent } from '../huesped-form/huesped-form.component';


@Component({
  selector: 'app-huesped-list',
  standalone: false,
  templateUrl: './huesped-list.component.html',
  styleUrl: './huesped-list.component.scss'
})
export class HuespedListComponent implements OnInit {
  registros: HuespedResponse[] = [];
  columnas = ['nombre', 'email', 'telefono', 'documento', 'nacionalidad', 'acciones'];
  cargando = false;
  eliminandoId: number | null = null;
  error = '';

  constructor(
    private service: HuespedService,
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
      error: error => this.error = mensajeErrorApi(error, 'No se pudo cargar el listado de huespedes.')
    });
  }

  abrirFormulario(registro?: HuespedResponse): void {
    const ref = this.dialog.open(HuespedFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: registro ?? null
    });
    ref.afterClosed().subscribe(guardado => { if (guardado) this.buscar(); });
  }

  eliminar(registro: HuespedResponse): void {
    if (this.eliminandoId !== null) return;
    if (!confirm(`¿Eliminar huésped "${registro.nombre}"? Dejará de aparecer en el listado de registros activos.`)) return;
    this.eliminandoId = registro.id;
    this.service.eliminar(registro.id).pipe(finalize(() => this.eliminandoId = null)).subscribe({
      next: () => {
        this.snackBar.open('Huésped eliminado', 'Cerrar', { duration: 3000 });
        this.buscar();
      },
      error: error => this.snackBar.open(mensajeErrorApi(error, 'No se pudo eliminar huésped.'), 'Cerrar', { duration: 5000 })
    });
  }
}
