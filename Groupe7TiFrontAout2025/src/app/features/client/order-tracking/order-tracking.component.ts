import { Component, OnInit, OnDestroy, NgIterable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService, SessionData } from '../../../services/session.service';
import { OrderService, Order, OrderItem } from '../../../services/order.service';

interface OrderStatus {
  status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'Pending';
  label: string;
  icon: string;
  color: string;
  progress: number;
  estimatedTime: number;
  message: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  sessionData: SessionData | null = null;
  private refreshInterval: any;
  private lastUpdate = new Date();

  // Propriétés pour l'historique
  orderHistory: Order[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  readonly STATUS_CONFIG: { [key: string]: OrderStatus } = {
    'PENDING': {
      status: 'PENDING',
      label: 'En attente',
      icon: '⏳',
      color: '#f59e0b',
      progress: 25,
      estimatedTime: 15,
      message: 'Votre commande a été reçue et sera préparée dans quelques instants.'
    },
    'IN_PREPARATION': {
      status: 'IN_PREPARATION',
      label: 'En préparation',
      icon: '👨‍🍳',
      color: '#3b82f6',
      progress: 50,
      estimatedTime: 10,
      message: 'Nos barmans préparent votre commande avec soin.'
    },
    'READY': {
      status: 'READY',
      label: 'Prêt',
      icon: '✅',
      color: '#10b981',
      progress: 75,
      estimatedTime: 2,
      message: 'Votre commande est prête ! Elle arrive dans quelques instants.'
    },
    'DELIVERED': {
      status: 'DELIVERED',
      label: 'Livré',
      icon: '🎉',
      color: '#8b5cf6',
      progress: 100,
      estimatedTime: 0,
      message: 'Bon appétit ! Profitez de votre commande.'
    }
  };

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadSessionData();
    this.loadActiveOrder();
    this.loadOrderHistory();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadSessionData() {
    this.sessionService.getSessionData().subscribe({
      next: (data) => {
        this.sessionData = data;
        // Ne pas rediriger automatiquement si pas de session data
        // Laisser l'utilisateur sur la page et afficher un message d'erreur si nécessaire
        if (!this.sessionData) {
          console.warn('Aucune donnée de session trouvée, mais on reste sur la page');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la session:', error);
        // Ne pas rediriger automatiquement en cas d'erreur
        // L'utilisateur peut toujours voir sa commande
      }
    });
  }

  private loadActiveOrder() {
    const activeOrderId = localStorage.getItem('activeOrderId');
    if (!activeOrderId) {
      this.error = 'Aucune commande active trouvée. Vous pouvez retourner au menu pour passer une nouvelle commande.';
      this.isLoading = false;
      return;
    }

    this.orderService.getOrderById(parseInt(activeOrderId)).subscribe({
      next: (order) => {
        console.log('📋 Commande reçue dans OrderTrackingComponent:', order);
        
        console.log('🔍 Status reçu du backend:', order.status);
        console.log('🔍 Status après normalisation:', this.orderService.normalizeStatus(order.status || 'PENDING'));
        
        // Normaliser les données reçues
        this.order = {
          ...order,
          status: this.orderService.normalizeStatus(order.status || 'PENDING'), // Valeur par défaut
          items: this.orderService.normalizeItems(order.items)
        };
        
        console.log('🔄 Commande normalisée:', this.order);
        this.isLoading = false;
        this.lastUpdate = new Date();
        this.checkOrderCompletion();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.error = 'Impossible de charger votre commande';
        this.isLoading = false;
      }
    });
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      // Rafraîchir la commande active et l'historique
      // Continuer même si la commande est livrée pour voir l'historique
      this.refreshOrderSilently();
      this.refreshHistorySilently();
    }, 10000); // Rafraîchissement toutes les 10 secondes
  }

  private refreshOrderSilently() {
    const activeOrderId = localStorage.getItem('activeOrderId');
    if (!activeOrderId) {
      return;
    }

    this.orderService.getOrderById(parseInt(activeOrderId)).subscribe({
      next: (order) => {
        // Mettre à jour silencieusement sans changer l'état de loading
        this.order = {
          ...order,
          status: this.orderService.normalizeStatus(order.status || 'PENDING'),
          items: this.orderService.normalizeItems(order.items)
        };
        this.lastUpdate = new Date();
        // Ne plus vérifier la completion automatiquement
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement silencieux:', error);
        // Ne pas afficher d'erreur à l'utilisateur lors du rafraîchissement automatique
      }
    });
  }

  private checkOrderCompletion() {
    // Ne plus rediriger automatiquement
    // L'utilisateur peut rester sur la page et voir l'historique
    // Il peut retourner au menu quand il le souhaite avec le bouton
  }

  getCurrentStatus(): OrderStatus | null {
    if (!this.order || !this.order.status) return null;
    return this.STATUS_CONFIG[this.order.status] || null;
  }

  getProgressPercentage(): number {
    if (!this.order || !this.order.status) return 0;
    const statusConfig = this.STATUS_CONFIG[this.order.status];
    return statusConfig ? statusConfig.progress : 0;
  }

  getEstimatedTimeRemaining(): string {
    if (!this.order || !this.order.status) return '';
    const status = this.STATUS_CONFIG[this.order.status];
    if (!status) return '';
    if (status.estimatedTime === 0) return 'Livré !';
    return `${status.estimatedTime} min`;
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getLastUpdateTime(): string {
    return this.lastUpdate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  refreshOrder() {
    this.isLoading = true;
    this.loadActiveOrder();
  }

  goBackToMenu() {
    this.router.navigate(['/menu']);
  }

  getTableNumber(): string {
    return this.sessionData?.tableNumber || 'N/A';
  }

  getFormattedRemainingTime(): string {
    if (!this.sessionData) return '--:--';
    const remainingSeconds = this.sessionService.getRemainingTime();
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  hasValidSession(): boolean {
    return this.sessionData !== null;
  }

  // Méthodes pour l'historique
  private loadOrderHistory() {
    this.isLoadingHistory = true;
    this.historyError = null;

    // Récupérer toutes les commandes et filtrer par table
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        console.log('📋 Historique des commandes reçu:', response);
        
        // Filtrer les commandes de la table actuelle
        const tableNumber = this.sessionData?.tableNumber;
        if (tableNumber) {
          this.orderHistory = response.sales
            .filter(order => order.tableNumber === tableNumber)
            .map(order => ({
              ...order,
              status: this.orderService.normalizeStatus(order.status),
              items: this.orderService.normalizeItems(order.items)
            }))
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()); // Plus récentes en premier
        }
        
        console.log('📋 Commandes filtrées pour la table:', tableNumber, this.orderHistory);
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.historyError = 'Impossible de charger l\'historique des commandes';
        this.isLoadingHistory = false;
      }
    });
  }

  refreshHistory() {
    this.loadOrderHistory();
  }

  private refreshHistorySilently() {
    // Rafraîchir l'historique sans afficher de loading
    const tableNumber = this.sessionData?.tableNumber;
    if (tableNumber) {
      this.orderService.getAllOrders().subscribe({
        next: (response) => {
          this.orderHistory = response.sales
            .filter(order => order.tableNumber === tableNumber)
            .map(order => ({
              ...order,
              status: this.orderService.normalizeStatus(order.status),
              items: this.orderService.normalizeItems(order.items)
            }))
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
        },
        error: (error) => {
          console.error('Erreur lors du rafraîchissement silencieux de l\'historique:', error);
        }
      });
    }
  }

  getItemsSummary(items: any[]): string {
    if (!items || items.length === 0) return 'Aucun article';
    if (items.length === 1) return items[0].mocktailName;
    return `${items.length} articles`;
  }

  getStatusConfig(status: string): OrderStatus {
    return this.STATUS_CONFIG[status] || this.STATUS_CONFIG['PENDING'];
  }
}
