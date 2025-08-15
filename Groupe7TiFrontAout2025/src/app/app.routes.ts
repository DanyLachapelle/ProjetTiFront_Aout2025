import { Routes } from '@angular/router';
import {authGuard} from './auth.guard';
import {LoginPageComponent} from './features/manager/login-page/login-page.component';
import {clientAccessGuard} from './client-access.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/menuPrincipal/home/home.component').then(m => m.HomeComponent) },

  // Routes pour la page de connexion
  { path: 'login', loadComponent: () => import('./features/manager/login-page/login-page.component').then(m => m.LoginPageComponent) },
  // Routes pour le dashboard (gérant)
  { path: 'dashboard', loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },

  // Routes pour la gestion des mocktails
  { path: 'gestion-mocktails', loadComponent: () => import('./features/manager/gestion-mocktails/gestion-mocktails.component').then(m => m.GestionMocktailsComponent), canActivate: [authGuard] },

  // Routes pour la gestion des ingrédients
  { path: 'gestion-ingredients', loadComponent: () => import('./features/manager/gestion-ingredients/gestion-ingredients.component').then(m => m.GestionIngredientsComponent), canActivate: [authGuard] },

  // Routes pour la gestion des ventes
  { path: 'gestion-sales', loadComponent: () => import('./features/manager/gestion-sales/gestion-sales.component').then(m => m.GestionSalesComponent), canActivate: [authGuard] },

  // Routes pour la gestion des commandes
  { path: 'orders', loadComponent: () => import('./features/manager/orders/orders.component').then(m => m.OrdersComponent), canActivate: [authGuard]},

  // Routes pour le menu client
  { path: 'menu', loadComponent: () => import('./features/client/menu/menu.component').then(m => m.MenuComponent), canActivate: [clientAccessGuard] },

  //Routes pour le menu mdp-oublié
  { path: 'forgot-password', loadComponent: () => import('./features/manager/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

  //Routes pour le menu reset-mdp
  { path: 'reset-password', loadComponent: () => import('./features/manager/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // Routes pour le suivi de commande client
  { path: 'order-tracking', loadComponent: () => import('./features/client/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent), canActivate: [clientAccessGuard] },



  // Flow d'accès client sécurisé
  //{ path: 'welcome', loadComponent: () => import('./features/client/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'geoloc', loadComponent: () => import('./features/client/geoloc-verification/geoloc-verification.component').then(m => m.GeolocVerificationComponent), canActivate: [clientAccessGuard]},
  { path: 'table', loadComponent: () => import('./features/client/table-number/table-number.component').then(m => m.TableNumberComponent), canActivate: [clientAccessGuard] },
  { path: 'session', loadComponent: () => import('./features/client/session-countdown/session-countdown.component').then(m => m.SessionCountdownComponent) },

  // Route par défaut - redirection vers dashboard
  { path: '**', redirectTo: '/' }
];
