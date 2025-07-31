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
  currentOrder: Order | null = null;
  loading = false;
  isSyncing = false;
  error = false;
  errorMessage = '';
  
  private orderSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  constructor(
    private orderTrackingService: OrderTrackingService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadCurrentOrder();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
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
    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }

  private loadCurrentOrder() {
    this.orderSubscription = this.orderTrackingService.getCurrentUserOrder().subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.error = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.error = true;
        this.errorMessage = 'Erreur lors du chargement de votre commande';
      }
    });
  }

  getStatusInfo(status: OrderStatus) {
    return this.orderTrackingService.getStatusInfo(status);
  }

  getOrderProgress(status: OrderStatus): number {
    return this.orderTrackingService.getOrderProgress(status);
  }

  getEstimatedTimeRemaining(): string {
    if (!this.currentOrder) return '';
    return this.orderTrackingService.getEstimatedTimeRemaining(this.currentOrder);
  }

  getEncouragingMessage(): string {
    if (!this.currentOrder) return '';
    return this.orderTrackingService.getEncouragingMessage(this.currentOrder);
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

  getTotalItems(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.items.reduce((total, item) => total + item.quantity, 0);
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