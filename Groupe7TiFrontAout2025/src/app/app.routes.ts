import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Routes pour les composants de développement/test
  { path: 'design', loadComponent: () => import('./features/dev/general-design/general-design.component').then(m => m.GeneralDesignComponent) },
  
  // Routes pour le dashboard (gérant)
  { path: 'dashboard', loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  
  // Routes pour la gestion des mocktails
  { path: 'gestion-mocktails', loadComponent: () => import('./features/manager/gestion-mocktails/gestion-mocktails.component').then(m => m.GestionMocktailsComponent) },
  
  // Routes pour la gestion des ingrédients
  { path: 'gestion-ingredients', loadComponent: () => import('./features/manager/gestion-ingredients/gestion-ingredients.component').then(m => m.GestionIngredientsComponent) },
  
  // Routes pour la gestion des ventes
  { path: 'gestion-sales', loadComponent: () => import('./features/manager/gestion-sales/gestion-sales.component').then(m => m.GestionSalesComponent) },
  
  // Routes pour le menu client
  { path: 'menu', loadComponent: () => import('./features/client/menu/menu.component').then(m => m.MenuComponent) },
  
  // Route par défaut - redirection vers dashboard
  { path: '**', redirectTo: '/dashboard' }
];
