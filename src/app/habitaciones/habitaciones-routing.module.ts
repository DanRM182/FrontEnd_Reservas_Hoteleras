import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HabitacionListComponent } from './habitacion-list/habitacion-list.component';

const routes: Routes = [{ path: '', component: HabitacionListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HabitacionesRoutingModule {}
