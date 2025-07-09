import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/design', pathMatch: 'full' },
  { path: 'design', loadComponent: () => import('./general-design/general-design.component').then(m => m.GeneralDesignComponent) },
  { path: '**', redirectTo: '/design' }
];
