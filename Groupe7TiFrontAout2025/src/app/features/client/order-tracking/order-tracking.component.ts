import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { OrderTrackingService } from '../../../services/order-tracking.service';
import { Order, OrderStatus } from '../../../models/order';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  currentOrders: Order[] = [];
  orderHistory: Order[] = [];
  loading = false;
  isSyncing = false;
  error = false;
  errorMessage = '';
  showHistory = false;
  
  private ordersSubscription?: Subscription;
  private historySubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  constructor(
    private orderTrackingService: OrderTrackingService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadCurrentOrder();
      this.loadOrderHistory();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  private startAutoRefresh() {
    this.autoRefreshSubscription = timer(0, 10000).subscribe(() => {
      this.syncData();
    });
  }

  private syncData() {
    this.isSyncing = true;
    this.loadCurrentOrder();
    this.loadOrderHistory();
    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }

  private loadCurrentOrder() {
    this.loading = true;
    this.ordersSubscription = this.orderTrackingService.getCurrentUserOrders().subscribe({
      next: (orders) => {
        this.currentOrders = orders;
        this.error = false;
        this.errorMessage = '';
        this.loading = false;
        console.log('Commandes chargées:', orders);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = true;
        this.errorMessage = 'Erreur lors du chargement de vos commandes';
        this.loading = false;
      }
    });
  }

  private loadOrderHistory() {
    this.historySubscription = this.orderTrackingService.getOrderHistory().subscribe({
      next: (history) => {
        this.orderHistory = history;
        console.log('Historique chargé:', history);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
      }
    });
  }

  getStatusInfo(status: OrderStatus) {
    return this.orderTrackingService.getStatusInfo(status);
  }

  getOrderProgress(status: OrderStatus): number {
    return this.orderTrackingService.getOrderProgress(status);
  }

  getEstimatedTimeRemaining(order: Order): string {
    return this.orderTrackingService.getEstimatedTimeRemaining(order);
  }

  getEncouragingMessage(order: Order): string {
    return this.orderTrackingService.getEncouragingMessage(order);
  }

  refreshOrder() {
    this.loading = true;
    this.syncData();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  backToMenu() {
    this.router.navigate(['/menu']);
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total: number, item: any) => total + item.quantity, 0);
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} €`;
  }
} 