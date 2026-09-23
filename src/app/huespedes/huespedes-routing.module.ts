import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HuespedListComponent } from './huesped-list/huesped-list.component';

const routes: Routes = [{ path: '', component: HuespedListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HuespedesRoutingModule {}
