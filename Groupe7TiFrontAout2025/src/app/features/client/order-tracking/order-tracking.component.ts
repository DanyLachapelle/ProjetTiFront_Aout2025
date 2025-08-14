import { Component, OnInit, OnDestroy, NgIterable, HostListener } from '@angular/core';
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

  // Browser back button confirmation
  showExitConfirmationModal = false;

  readonly STATUS_CONFIG: { [key: string]: OrderStatus } = {
    'PENDING': {
      status: 'PENDING',
      label: 'Pending',
      icon: '⏳',
      color: '#f59e0b',
      progress: 25,
      estimatedTime: 15,
      message: 'Your order has been received and will be prepared shortly.'
    },
    'IN_PREPARATION': {
      status: 'IN_PREPARATION',
      label: 'In Preparation',
      icon: '👨‍🍳',
      color: '#3b82f6',
      progress: 50,
      estimatedTime: 10,
      message: 'Our bartenders are carefully preparing your order.'
    },
    'READY': {
      status: 'READY',
      label: 'Ready',
      icon: '✅',
      color: '#10b981',
      progress: 75,
      estimatedTime: 2,
      message: 'Your order is ready! It will arrive in a few moments.'
    },
    'DELIVERED': {
      status: 'DELIVERED',
      label: 'Delivered',
      icon: '🎉',
      color: '#8b5cf6',
      progress: 100,
      estimatedTime: 0,
      message: 'Enjoy your order!'
    }
  };

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private orderService: OrderService
  ) {
    // Push a state to enable back button detection
    history.pushState(null, '', location.href);
  }

  // Browser back button detection
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    event.preventDefault();
    this.showExitConfirmationModal = true;
  }

  ngOnInit() {
    this.loadSessionData();
    this.loadActiveOrder();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Exit confirmation methods
  confirmExit() {
    this.showExitConfirmationModal = false;
    // Clear session and redirect to homepage
    this.sessionService.endSession();
  }

  cancelExit() {
    this.showExitConfirmationModal = false;
    // Push state again to prevent immediate back navigation
    history.pushState(null, '', location.href);
  }

  private loadSessionData() {
    this.sessionService.getSessionData().subscribe({
      next: (data) => {
        this.sessionData = data;
        // Let user stay on page and display error message if needed
        if (!this.sessionData) {
          console.warn('No session data found, but staying on the page');
        }
      },
      error: (error) => {
        console.error('Error loading session:', error);
        // Ne pas rediriger automatiquement en cas d'erreur
        // L'utilisateur peut toujours voir sa commande
      }
    });
  }

  private loadActiveOrder() {
    const activeOrderId = localStorage.getItem('activeOrderId');
    if (!activeOrderId) {
      this.error = 'No active order found. You can return to the menu to place a new order.';
      this.isLoading = false;
      return;
    }

    this.orderService.getOrderById(parseInt(activeOrderId)).subscribe({
      next: (order) => {
        console.log('📋 Order received in OrderTrackingComponent:', order);

        console.log('🔍 Status received from backend:', order.status);
        console.log('🔍 Status after normalization:', this.orderService.normalizeStatus(order.status || 'PENDING'));

        // Normalize received data
        this.order = {
          ...order,
          status: this.orderService.normalizeStatus(order.status || 'PENDING'), // Default value
          items: this.orderService.normalizeItems(order.items)
        };

        console.log('🔄 Normalized order:', this.order);
        this.isLoading = false;
        this.lastUpdate = new Date();
        this.checkOrderCompletion();
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Unable to load your order';
        this.isLoading = false;
      }
    });
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      // Rafraîchir la commande active
      this.refreshOrderSilently();
    }, 10000); // Rafraîchissement toutes les 10 secondes
  }

  private refreshOrderSilently() {
    const activeOrderId = localStorage.getItem('activeOrderId');
    if (!activeOrderId) {
      return;
    }

    this.orderService.getOrderById(parseInt(activeOrderId)).subscribe({
      next: (order) => {
        // Update silently without changing loading state
        this.order = {
          ...order,
          status: this.orderService.normalizeStatus(order.status || 'PENDING'),
          items: this.orderService.normalizeItems(order.items)
        };
        this.lastUpdate = new Date();
        // No longer check completion automatically
      },
      error: (error) => {
        console.error('Error during silent refresh:', error);
        // Don't display error to user during automatic refresh
      }
    });
  }

  private checkOrderCompletion() {
    if (!this.order) return;

    // If order is delivered, clear the active order ID after a delay
    if (this.order.status === 'DELIVERED') {
      console.log('✅ Order completed - will clear active order ID in 30 seconds');
      setTimeout(() => {
        this.clearActiveOrder();
      }, 30000); // Clear after 30 seconds to let user see the completion
    }
  }

  private clearActiveOrder() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('activeOrderId');
      console.log('🧹 Active order ID cleared from localStorage');
    }
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
    if (status.estimatedTime === 0) return 'Delivered!';
    return `${status.estimatedTime} min`;
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getLastUpdateTime(): string {
    return this.lastUpdate.toLocaleTimeString('en-US', {
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
    // If order is delivered, clear the active order ID when user goes back to menu
    if (this.order && this.order.status === 'DELIVERED') {
      this.clearActiveOrder();
    }
    this.router.navigate(['/menu']);
  }

  getTableNumber(): string {
    return this.sessionData?.tableNumber || 'N/A';
  }

  getStatusConfig(status: string): OrderStatus {
    return this.STATUS_CONFIG[status] || this.STATUS_CONFIG['PENDING'];
  }
}
