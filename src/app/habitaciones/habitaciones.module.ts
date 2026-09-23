import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { HabitacionesRoutingModule } from './habitaciones-routing.module';
import { HabitacionListComponent } from './habitacion-list/habitacion-list.component';
import { HabitacionFormComponent } from './habitacion-form/habitacion-form.component';
import { HabitacionEstadoComponent } from './habitacion-estado/habitacion-estado.component';

@NgModule({
  declarations: [HabitacionListComponent, HabitacionFormComponent, HabitacionEstadoComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, HabitacionesRoutingModule]
})
export class HabitacionesModule {}
