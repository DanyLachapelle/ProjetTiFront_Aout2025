import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTrackingService } from '../../../services/order-tracking.service';
import { Order, OrderStatus } from '../../../models/order';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  activeOrders: Order[] = [];
  loading = true;
  error: string | null = null;
  isSyncing = false;
  
  // Statistics
  orderStats = {
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    total: 0
  };

  private ordersSubscription?: Subscription;
  private statsSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  // Status enum for template
  OrderStatus = OrderStatus;

  constructor(private orderTrackingService: OrderTrackingService) {}

  ngOnInit() {
    // Only initialize if we're in browser environment
    if (typeof window !== 'undefined') {
      this.loadOrders();
      this.loadStats();
      this.startAutoRefresh();
    } else {
      // In SSR, just set loading to false
      this.loading = false;
      this.error = 'Cette page nécessite un navigateur pour fonctionner correctement.';
    }
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  // Start auto-refresh every 3 seconds
  private startAutoRefresh() {
    this.autoRefreshSubscription = timer(3000, 3000).subscribe(() => {
      this.syncData();
    });
  }

  // Sync data without showing loading state
  private syncData() {
    this.isSyncing = true;
    // Force reload of current data
    this.loadOrders();
    this.loadStats();
    
    // Hide syncing indicator after 1 second
    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }

  // Clear all test data
  clearTestData() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données de test ? Cette action ne peut pas être annulée.')) {
      this.orderTrackingService.clearAllData();
      alert('Données de test supprimées avec succès !');
    }
  }

  // Load all orders
  private loadOrders() {
    this.ordersSubscription = this.orderTrackingService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.activeOrders = orders.filter(order => order.status !== OrderStatus.LIVRE);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Erreur lors du chargement des commandes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  // Load statistics
  private loadStats() {
    this.statsSubscription = this.orderTrackingService.getOrderStats().subscribe({
      next: (stats) => {
        this.orderStats = {
          ...stats,
          total: stats.pending + stats.preparing + stats.ready + stats.delivered
        };
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  // Update order status
  updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const success = this.orderTrackingService.updateOrderStatus(orderId, newStatus);
    
    if (!success) {
      alert('Erreur lors de la mise à jour du statut de la commande. Veuillez réessayer.');
    } else {
      // Show success message
      const order = this.orders.find(o => o.id === orderId);
      const statusInfo = this.orderTrackingService.getStatusInfo(newStatus);
      
      // You could replace this with a toast notification
      console.log(`Commande ${order?.id} mise à jour vers ${statusInfo.label}`);
    }
  }

  // Get status info for display
  getStatusInfo(status: OrderStatus) {
    return this.orderTrackingService.getStatusInfo(status);
  }

  // Get next actions for an order
  getNextActions(status: OrderStatus) {
    return this.orderTrackingService.getNextActions(status);
  }

  // Get elapsed time since order creation
  getElapsedTime(createdAt: Date): string {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60000); // minutes
    
    if (elapsed < 60) {
      return `Il y a ${elapsed} min`;
    } else {
      const hours = Math.floor(elapsed / 60);
      const minutes = elapsed % 60;
      return `Il y a ${hours}h ${minutes}min`;
    }
  }

  // Format time for display
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Get priority class based on elapsed time and status
  getPriorityClass(order: Order): string {
    const elapsed = (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000;
    
    if (order.status === OrderStatus.PRET && elapsed > 10) {
      return 'priority-urgent'; // Ready for more than 10 minutes
    } else if (order.status === OrderStatus.EN_PREPARATION && elapsed > 20) {
      return 'priority-high'; // Preparing for more than 20 minutes
    } else if (elapsed > 30) {
      return 'priority-medium'; // Any order older than 30 minutes
    }
    
    return 'priority-normal';
  }

  // Filter orders by status
  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.activeOrders.filter(order => order.status === status);
  }

  // Get total items count for an order
  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Refresh orders manually
  refreshOrders() {
    this.loading = true;
    this.syncData();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
} 