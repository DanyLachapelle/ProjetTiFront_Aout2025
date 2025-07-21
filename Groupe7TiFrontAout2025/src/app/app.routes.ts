import { Routes } from '@angular/router';
import {authGuard} from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Routes pour la page de connexion
  { path: 'login', loadComponent: () => import('./features/manager/login-page/login-page.component').then(m => m.LoginPageComponent) },
  // Routes pour les composants de développement/test
  { path: 'design', loadComponent: () => import('./features/dev/general-design/general-design.component').then(m => m.GeneralDesignComponent), canActivate: [authGuard] },

  // Routes pour le dashboard (gérant)
  { path: 'dashboard', loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },

  // Routes pour la gestion des mocktails
  { path: 'gestion-mocktails', loadComponent: () => import('./features/manager/gestion-mocktails/gestion-mocktails.component').then(m => m.GestionMocktailsComponent), canActivate: [authGuard] },

  // Routes pour la gestion des ingrédients
  { path: 'gestion-ingredients', loadComponent: () => import('./features/manager/gestion-ingredients/gestion-ingredients.component').then(m => m.GestionIngredientsComponent), canActivate: [authGuard] },

  // Routes pour la gestion des ventes
  { path: 'gestion-sales', loadComponent: () => import('./features/manager/gestion-sales/gestion-sales.component').then(m => m.GestionSalesComponent), canActivate: [authGuard] },

  // Routes pour le menu client
  { path: 'menu', loadComponent: () => import('./features/client/menu/menu.component').then(m => m.MenuComponent), canActivate: [authGuard] },

  // Route par défaut - redirection vers dashboard
  { path: '**', redirectTo: '/dashboard' }
];
