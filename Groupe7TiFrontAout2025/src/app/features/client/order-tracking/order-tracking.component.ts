import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderTrackingService } from '../../../services/order-tracking.service';
import { Order, OrderStatus } from '../../../models/order';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  currentOrder: Order | null = null;
  loading = true;
  error: string | null = null;
  isSyncing = false;
  
  private orderSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  // Status enum for template
  OrderStatus = OrderStatus;

  constructor(
    private orderTrackingService: OrderTrackingService,
    private router: Router
  ) {}

  ngOnInit() {
    // Only initialize if we're in browser environment
    if (typeof window !== 'undefined') {
      this.loadCurrentOrder();
      this.startAutoRefresh();
    } else {
      this.loading = false;
      this.error = 'Cette page nécessite un navigateur pour fonctionner correctement.';
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

  // Start auto-refresh every 3 seconds
  private startAutoRefresh() {
    this.autoRefreshSubscription = timer(3000, 3000).subscribe(() => {
      this.syncOrder();
    });
  }

  // Sync order without showing loading state
  private syncOrder() {
    this.isSyncing = true;
    this.loadCurrentOrder();
    
    // Hide syncing indicator after 1 second
    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }

  // Load current user's order
  private loadCurrentOrder() {
    this.orderSubscription = this.orderTrackingService.getCurrentUserOrder().subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.loading = false;
        
        // If no order, redirect to menu after 3 seconds
        if (!order) {
          setTimeout(() => {
            this.router.navigate(['/menu']);
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Erreur lors du chargement de votre commande. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  // Get status info for display
  getStatusInfo(status: OrderStatus) {
    return this.orderTrackingService.getStatusInfo(status);
  }

  // Get order progress percentage
  getOrderProgress(status: OrderStatus): number {
    return this.orderTrackingService.getOrderProgress(status);
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

  // Get estimated time remaining
  getEstimatedTimeRemaining(): string {
    if (!this.currentOrder || !this.currentOrder.estimatedTime) {
      return 'Non disponible';
    }
    
    const remaining = this.currentOrder.estimatedTime;
    if (remaining <= 0) {
      return 'Prêt !';
    }
    
    return `${remaining} min`;
  }

  // Get total items count
  getTotalItems(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get encouraging message based on status
  getEncouragingMessage(): string {
    if (!this.currentOrder) return '';
    
    switch (this.currentOrder.status) {
      case OrderStatus.EN_ATTENTE:
        return 'Votre commande a été reçue ! Notre équipe va bientôt commencer la préparation.';
      case OrderStatus.EN_PREPARATION:
        return 'Parfait ! Vos délicieux mocktails sont en cours de préparation avec soin.';
      case OrderStatus.PRET:
        return 'Excellent ! Votre commande est prête à être récupérée. Veuillez vous présenter au comptoir.';
      case OrderStatus.LIVRE:
        return 'Savourez vos mocktails ! Merci d\'avoir choisi Helha Fresh.';
      default:
        return 'Nous travaillons sur votre commande !';
    }
  }

  // Refresh order manually
  refreshOrder() {
    this.loading = true;
    this.syncOrder();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  // Go back to menu
  goToMenu() {
    this.router.navigate(['/menu']);
  }

  // Clear current order and go to menu
  clearOrder() {
    this.orderTrackingService.clearCurrentUserOrder();
    this.router.navigate(['/menu']);
  }
} 