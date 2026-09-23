import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { HuespedesRoutingModule } from './huespedes-routing.module';
import { HuespedListComponent } from './huesped-list/huesped-list.component';
import { HuespedFormComponent } from './huesped-form/huesped-form.component';


@NgModule({
  declarations: [HuespedListComponent, HuespedFormComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, HuespedesRoutingModule]
})
export class HuespedesModule {}
