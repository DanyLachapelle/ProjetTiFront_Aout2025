import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Données du gérant connecté
  currentManager = {
    name: 'Marie Dupont',
    role: 'Gérant',
    avatar: '👨‍💼'
  };

  // Statistiques rapides
  quickStats = {
    totalSales: 1247.50,
    todaySales: 89.30,
    activeMocktails: 7,
    lowStockItems: 2
  };

  // Variables pour l'heure en temps réel
  currentTime: string = '';
  currentDate: string = '';
  private timeInterval: number | null = null;

  // Variables pour les modales
  showNotificationsModal: boolean = false;
  showSettingsModal: boolean = false;

  // Formulaire de changement de mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Menu de navigation
  menuItems = [
    {
      id: 'gestion-mocktails',
      title: 'Gestion des Mocktails',
      description: 'Créer, modifier et gérer vos recettes de mocktails',
      icon: '🍹',
      color: 'primary',
      route: '/gestion-mocktails',
      stats: {
        total: 7,
        available: 6,
        unavailable: 1
      }
    },
    {
      id: 'gestion-ingredients',
      title: 'Gestion des Ingrédients',
      description: 'Gérer les stocks et les alertes de réapprovisionnement',
      icon: '🧪',
      color: 'secondary',
      route: '/gestion-ingredients',
      stats: {
        total: 12,
        good: 8,
        warning: 2,
        critical: 2
      }
    },
    {
      id: 'revenue',
      title: 'Chiffre d\'Affaires',
      description: 'Visualiser et analyser vos performances commerciales',
      icon: '📊',
      color: 'success',
      route: '/revenue',
      stats: {
        today: '89.30€',
        week: '647.80€',
        month: '2847.50€'
      }
    },
    {
      id: 'gestion-sales',
      title: 'Historique des Ventes',
      description: 'Consulter l\'historique complet de vos transactions',
      icon: '🧾',
      color: 'warning',
      route: '/gestion-sales',
      stats: {
        today: 12,
        week: 89,
        month: 342
      }
    }
  ];

  // Alertes actives
  activeAlerts = [
    {
      type: 'stock',
      message: 'Stock critique : Menthe fraîche (5g restants)',
      severity: 'critical',
      icon: '⚠️'
    },
    {
      type: 'stock',
      message: 'Stock faible : Jus d\'ananas (15cl restants)',
      severity: 'warning',
      icon: '⚠️'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialiser immédiatement l'heure et la date
    this.updateTime();
    
    // Démarrer l'intervalle pour mettre à jour l'heure
    this.startTimeInterval();
  }

  ngOnDestroy(): void {
    // Nettoyer l'intervalle
    this.stopTimeInterval();
  }

  // Démarrer l'intervalle de temps
  private startTimeInterval(): void {
    if (this.timeInterval === null) {
      this.timeInterval = window.setInterval(() => {
        this.updateTime();
      }, 1000);
    }
  }

  // Arrêter l'intervalle de temps
  private stopTimeInterval(): void {
    if (this.timeInterval !== null) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  // Mettre à jour l'heure et la date
  private updateTime(): void {
    try {
      const now = new Date();
      
      // Mettre à jour l'heure (format HH:MM seulement pour l'affichage)
      this.currentTime = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Mettre à jour la date (seulement si elle a changé)
      const newDate = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (this.currentDate !== newDate) {
        this.currentDate = newDate;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'heure:', error);
      // En cas d'erreur, utiliser des valeurs par défaut
      this.currentTime = '--:--';
      this.currentDate = 'Date non disponible';
    }
  }

  // Navigation vers une page
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Déconnexion
  logout(): void {
    // TODO: Implémenter la logique de déconnexion
    console.log('Déconnexion demandée');
    // this.router.navigate(['/login']);
  }

  // Afficher les notifications
  showNotifications(): void {
    this.showNotificationsModal = true;
  }

  // Fermer les notifications
  closeNotifications(): void {
    this.showNotificationsModal = false;
  }

  // Afficher les paramètres
  showSettings(): void {
    this.showSettingsModal = true;
  }

  // Fermer les paramètres
  closeSettings(): void {
    this.showSettingsModal = false;
    // Réinitialiser le formulaire
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Changer le mot de passe
  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (this.passwordForm.newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // TODO: Implémenter la logique de changement de mot de passe
    console.log('Changement de mot de passe demandé');
    alert('Mot de passe changé avec succès !');
    this.closeSettings();
  }

  // Obtenir la classe de couleur pour les cartes
  getCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': 'card-primary',
      'secondary': 'card-secondary',
      'success': 'card-success',
      'warning': 'card-warning'
    };
    return colorMap[color] || 'card-primary';
  }

  // Obtenir la classe de sévérité pour les alertes
  getAlertSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'alert-critical',
      'warning': 'alert-warning',
      'info': 'alert-info'
    };
    return severityMap[severity] || 'alert-info';
  }

  // Formater un montant
  formatAmount(amount: number): string {
    return amount.toFixed(2) + '€';
  }

  // Méthodes publiques pour l'heure et la date
  getCurrentTime(): string {
    return this.currentTime || '--:--';
  }

  getCurrentDate(): string {
    return this.currentDate || 'Date non disponible';
  }
}
