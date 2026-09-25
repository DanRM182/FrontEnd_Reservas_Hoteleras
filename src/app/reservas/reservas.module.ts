import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReservaFormComponent } from './reserva-form/reserva-form.component';
import { MaterialModule } from '../material/material.module';
import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservaListComponent } from './reserva-list/reserva-list.component';

@NgModule({
  declarations: [ReservaListComponent, ReservaFormComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, ReservasRoutingModule]
})
export class ReservasModule {}
