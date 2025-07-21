import { Routes } from '@angular/router';
import { HomeComponent } from './features/menuPrincipal/home/home.component';
import {LoginPageComponent} from './features/manager/login-page/login-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent  },

  // Routes pour la page de connexion
  { path: 'login', loadComponent: () => import('./features/manager/login-page/login-page.component').then(m => m.LoginPageComponent) },
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

  // Flow d'accès client sécurisé
  { path: 'geoloc', loadComponent: () => import('./features/client/geoloc-verification/geoloc-verification.component').then(m => m.GeolocVerificationComponent) },
  { path: 'table', loadComponent: () => import('./features/client/table-number/table-number.component').then(m => m.TableNumberComponent) },
  { path: 'session', loadComponent: () => import('./features/client/session-countdown/session-countdown.component').then(m => m.SessionCountdownComponent) },

  // Route par défaut - redirection vers dashboard
  { path: '**', redirectTo: '/dashboard' }
];
