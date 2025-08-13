import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MocktailService, Mocktail} from '../../../services/mocktail.service';
import {Ingredient, IngredientService} from '../../../services/ingredient.service';
import {SaleService} from '../../../services/sale.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Connected manager data
  currentManager = {
    name: 'Marie Dupont',
    role: 'Manager',
    avatar: '👨‍💼'
  };

  // Quick statistics
  quickStats = {
    totalSales: 1247.50,
    todaySales: 89.30,
    activeMocktails: 7,
    lowStockItems: 2
  };

  // Real-time time variables
  currentTime: string = '';
  currentDate: string = '';
  private timeInterval: number | null = null;

  // Modal variables
  showNotificationsModal: boolean = false;
  showSettingsModal: boolean = false;

  // Password change form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Navigation menu
  menuItems = [
    {
      id: 'gestion-mocktails',
      title: 'Mocktails Management',
      description: 'Create, modify and manage your mocktail recipes',
      icon: '🍹',
      color: 'primary',
      route: '/gestion-mocktails',
      stats: {
        total: 0,
        available: 0,
        unavailable: 0
      }
    },

    {
      id: 'gestion-ingredients',
      title: 'Ingredients Management',
      description: 'Manage stocks and restocking alerts',
      icon: '🧪',
      color: 'secondary',
      route: '/gestion-ingredients',
      stats: {
        total: 0,
        good: 0,
        warning: 0,
        critical: 0
      }
    },
    {
      id: 'gestion-sales',
      title: 'Sales History',
      description: 'View complete transaction history',
      icon: '🧾',
      color: 'warning',
      route: '/gestion-sales',
      stats: {
        today: '€89.30',
        week: '€647.80',
        month: '€2847.50'
      }
    },
    {
      id: 'gestion-commandes',
      title: 'Orders Management',
      description: 'Track and manage active orders in real-time',
      icon: '📋',
      color: 'success',
      route: '/orders',
      stats: {
        pending: 0,
        preparing: 0,
        ready: 0,
        total: 0
      }
    },

  ];

  // Active alerts
  // activeAlerts = [
  //   {
  //     type: 'stock',
  //     message: 'Critical stock: Fresh mint (5g remaining)',
  //     severity: 'critical',
  //     icon: '⚠️'
  //   },
  //   {
  //     type: 'stock',
  //     message: 'Low stock: Pineapple juice (15cl remaining)',
  //     severity: 'warning',
  //     icon: '⚠️'
  //   }
  // ];
  activeAlerts: { message: string; severity: string; icon: string; type: string }[] = [];
  constructor(
    private router: Router,
    private mocktailService: MocktailService,
    private ingredientService: IngredientService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    // Initialize time and date immediately
    this.updateTime();

    // Start interval to update time
    this.startTimeInterval();

    // Load mocktails data for dashboard
    this.loadMocktailsStats();

    this.loadIngredientStats();

    this.loadOrdersStats();

  }

  ngOnDestroy(): void {
    // Clean up interval
    this.stopTimeInterval();
  }

  // Start time interval
  private startTimeInterval(): void {
    if (this.timeInterval === null && typeof window !== 'undefined') {
      this.timeInterval = window.setInterval(() => {
        this.updateTime();
      }, 1000);
    }
  }

  // Stop time interval
  private stopTimeInterval(): void {
    if (this.timeInterval !== null && typeof window !== 'undefined') {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  // Update time and date
  private updateTime(): void {
    try {
      const now = new Date();

      // Update time (HH:MM format only for display)
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Update date (only if it has changed)
      const newDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (this.currentDate !== newDate) {
        this.currentDate = newDate;
      }
    } catch (error) {
      console.error('Error updating time:', error);
      // In case of error, use default values
      this.currentTime = '--:--';
      this.currentDate = 'Date not available';
    }
  }

  // Navigate to a page
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Logout
  logout(): void {
    console.log('Logout requested');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Show notifications
  showNotifications(): void {
    this.showNotificationsModal = true;
  }

  // Close notifications
  closeNotifications(): void {
    this.showNotificationsModal = false;
  }

  // Show settings
  showSettings(): void {
    this.showSettingsModal = true;
  }

  // Close settings
  closeSettings(): void {
    this.showSettingsModal = false;
    // Reset form
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Change password
  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('New password must contain at least 6 characters');
      return;
    }

    // TODO: Implement password change logic
    console.log('Password change requested');
    alert('Password changed successfully!');
    this.closeSettings();
  }

  // Load mocktails statistics for dashboard
  private loadMocktailsStats(): void {
    this.mocktailService.getAll().subscribe({
      next: (mocktails: Mocktail[]) => {
        const total = mocktails.length;
        const available = mocktails.filter((m: Mocktail) => m.available).length;
        const unavailable = total - available;

        // Update the mocktails card stats
        const mocktailsCard = this.menuItems.find(item => item.id === 'gestion-mocktails');
        if (mocktailsCard) {
          mocktailsCard.stats = {
            total: total,
            available: available,
            unavailable: unavailable
          };
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques des mocktails:', error);
        // En cas d'erreur, on garde les valeurs par défaut (0)
      }
    });
  }

  // Load orders statistics for dashboard
  private loadOrdersStats(): void {
    this.saleService.getAllSales().subscribe({
      next: (data: any) => {
        // Vérifier si data est un tableau ou contient un tableau
        const sales = Array.isArray(data) ? data : (data.sales || data.data || []);

        if (!Array.isArray(sales)) {
          console.error('Les ventes ne sont pas un tableau:', data);
          return;
        }

        // Normaliser les statuts comme dans le composant Orders
        const normalizedSales = sales.map((sale: any) => ({
          ...sale,
          status: this.normalizeStatus(sale.status)
        }));

        const total = normalizedSales.length;
        const pending = normalizedSales.filter((s: any) => s.status === 'PENDING').length;
        const preparing = normalizedSales.filter((s: any) => s.status === 'IN_PREPARATION').length;
        const ready = normalizedSales.filter((s: any) => s.status === 'READY').length;

        // Update the orders card stats
        const ordersCard = this.menuItems.find(item => item.id === 'gestion-commandes');
        if (ordersCard) {
          ordersCard.stats = {
            pending: pending,
            preparing: preparing,
            ready: ready,
            total: total
          };
        }

        // Calculer les ventes du jour
        this.calculateTodaySales(sales);

        console.log('📊 Données reçues:', data);
        console.log('📊 Ventes normalisées:', normalizedSales);
        console.log('📊 Statistiques commandes :', {
          total,
          pending,
          preparing,
          ready
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques des commandes:', error);
        // En cas d'erreur, on garde les valeurs par défaut (0)
      }
    });
  }

  // Calculer les ventes du jour
  private calculateTodaySales(sales: any[]): void {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Transformer les données du backend vers le format frontend si nécessaire
    const transformedSales = sales.map((sale: any) => ({
      saleDate: sale.SaleDate || sale.saleDate,
      totalAmount: sale.TotalAmount || sale.totalAmount || 0
    }));

    // Filtrer les ventes du jour
    const todaySales = transformedSales.filter((sale: any) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    // Calculer le total des ventes du jour
    const todayTotal = todaySales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);

    // Calculer les ventes de la semaine (même logique que gestion-sales)
    const day = (today.getDay() + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const weekSales = transformedSales.filter((sale: any) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });
    const weekTotal = weekSales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);

    // Calculer les ventes du mois
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const monthSales = transformedSales.filter((sale: any) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= startOfMonth && saleDate <= endOfDay;
    });
    const monthTotal = monthSales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0);

    // Mettre à jour la carte des ventes
    const salesCard = this.menuItems.find(item => item.id === 'gestion-sales');
    if (salesCard) {
      salesCard.stats = {
        today: `€${todayTotal.toFixed(2)}`,
        week: `€${weekTotal.toFixed(2)}`,
        month: `€${monthTotal.toFixed(2)}`
      };
    }

    console.log('💰 Ventes calculées:', {
      todaySales: todaySales.length,
      todayTotal: todayTotal,
      weekSales: weekSales.length,
      weekTotal: weekTotal,
      monthSales: monthSales.length,
      monthTotal: monthTotal,
      salesCard: salesCard?.stats
    });
  }

  // Normaliser les statuts comme dans le service OrderService
  private normalizeStatus(status: string): string {
    if (!status) return 'PENDING';

    const statusMap: { [key: string]: string } = {
      'Pending': 'PENDING',
      'In Preparation': 'IN_PREPARATION',
      'Ready': 'READY',
      'Delivered': 'DELIVERED',
      'PENDING': 'PENDING',
      'IN_PREPARATION': 'IN_PREPARATION',
      'READY': 'READY',
      'DELIVERED': 'DELIVERED'
    };

    return statusMap[status] || 'PENDING';
  }

  // Get color class for cards
  getCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': 'card-primary',
      'secondary': 'card-secondary',
      'success': 'card-success',
      'warning': 'card-warning'
    };
    return colorMap[color] || 'card-primary';
  }

  // Get severity class for alerts
  getAlertSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'alert-critical',
      'warning': 'alert-warning',
      'info': 'alert-info'
    };
    return severityMap[severity] || 'alert-info';
  }

  // Format an amount
  formatAmount(amount: number): string {
    return amount.toFixed(2) + '€';
  }

  // Public methods for time and date
  getCurrentTime(): string {
    return this.currentTime || '--:--';
  }

  getCurrentDate(): string {
    return this.currentDate || 'Date not available';
  }
  getStockStatus(stock: number, limit: number): 'good' | 'warning' | 'critical' {
    if (stock < limit * 0.8) return 'critical';
    if (stock > limit * 1.5) return 'good';
    return 'warning';
  }

  private loadIngredientStats(): void {
    this.ingredientService.GetAll().subscribe({
      next: (data: any) => {
        const ingredients = Array.isArray(data) ? data : data.ingredients;

        if (!Array.isArray(ingredients)) {
          console.error('Les ingrédients ne sont pas un tableau:', ingredients);
          return;
        }

        // Calcul des statuts
        const good = ingredients.filter(i => this.getStockStatus(i.quantity, i.restock_threshold) === 'good').length;
        const warning = ingredients.filter(i => this.getStockStatus(i.quantity, i.restock_threshold) === 'warning').length;
        const critical = ingredients.filter(i => this.getStockStatus(i.quantity, i.restock_threshold) === 'critical').length;

        // Mise à jour de la carte des stats
        const ingredientCard = this.menuItems.find(item => item.id === 'gestion-ingredients');
        if (ingredientCard) {
          ingredientCard.stats = {
            total: ingredients.length,
            good,
            warning,
            critical
          };
        }

        // 💡 Génération dynamique des alertes
        this.activeAlerts = ingredients
          .filter(i => {
            const status = this.getStockStatus(i.quantity, i.restock_threshold);
            return status === 'critical' || status === 'warning';
          })
          .map(i => {
            const status = this.getStockStatus(i.quantity, i.restock_threshold);
            return {
              type: 'stock',
              message: `${status === 'critical' ? 'Critical' : 'Low'} stock: ${i.name} (${i.quantity}${i.unit} remaining)`,
              severity: status,
              icon: '⚠️'
            };
          });

        // ✅ Logs utiles
        console.log('📦 Ingrédients reçus :', ingredients.map(i => ({
          name: i.name,
          quantity: i.quantity,
          threshold: i.restock_threshold,
          status: this.getStockStatus(i.quantity, i.restock_threshold)
        })));

        console.log('📊 Statistiques ingrédients :', {
          total: ingredients.length,
          good,
          warning,
          critical
        });

        console.log('🧾 Carte mise à jour (gestion-ingredients) :', ingredientCard);

        // Log des alertes pour vérification
        console.log('🔔 Alertes actives:', this.activeAlerts);
      },
      error: (err) => {
        console.error('Erreur chargement ingrédients :', err);
      }
    });
  }

  // Méthodes pour les statistiques rapides
  getMocktailsStats() {
    const mocktailsItem = this.menuItems.find(item => item.id === 'gestion-mocktails');
    return mocktailsItem ? mocktailsItem.stats : { total: 0, available: 0, unavailable: 0 };
  }

  getOrdersStats() {
    const ordersItem = this.menuItems.find(item => item.id === 'gestion-commandes');
    return ordersItem ? ordersItem.stats : { pending: 0, preparing: 0, ready: 0 };
  }

  getSalesStats() {
    const salesItem = this.menuItems.find(item => item.id === 'gestion-sales');
    if (salesItem && salesItem.stats) {
      return {
        today: salesItem.stats.today || '€0.00',
        week: salesItem.stats.week || '€0.00',
        month: salesItem.stats.month || '€0.00'
      };
    }
    return { today: '€0.00', week: '€0.00', month: '€0.00' };
  }

  getIngredientsStats() {
    const ingredientsItem = this.menuItems.find(item => item.id === 'gestion-ingredients');
    return ingredientsItem ? ingredientsItem.stats : { total: 0, good: 0, warning: 0, critical: 0 };
  }
}
