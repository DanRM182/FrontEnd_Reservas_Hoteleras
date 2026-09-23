import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservaListComponent } from './reserva-list/reserva-list.component';

@NgModule({
  declarations: [ReservaListComponent],
  imports: [CommonModule, MaterialModule, ReservasRoutingModule]
})
export class ReservasModule {}
