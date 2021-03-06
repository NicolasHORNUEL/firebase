import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchListComponent } from './components/search-list/search-list.component';
import { TableComponent } from './components/table/table.component';

const routes: Routes = [
  { path: 'table', component: TableComponent },
  { path: 'list', component: SearchListComponent },
  { path: '', redirectTo: 'table', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
