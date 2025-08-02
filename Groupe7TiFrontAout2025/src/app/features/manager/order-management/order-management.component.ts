import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { OrderTrackingService } from '../../../services/order-tracking.service';
import { Order, OrderStatus, OrderStats } from '../../../models/order';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = false;
  isSyncing = false;
  selectedOrder: Order | null = null;
  statusUpdateNotes = '';
  
  // Exposer OrderStatus pour le template
  OrderStatus = OrderStatus;
  
  // Statistiques
  stats: OrderStats = {
    enAttente: 0,
    enPreparation: 0,
    pret: 0,
    livre: 0,
    total: 0
  };

  private ordersSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  constructor(
    private orderTrackingService: OrderTrackingService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadOrders();
      this.loadStats();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  private startAutoRefresh() {
    this.autoRefreshSubscription = timer(3000, 3000).subscribe(() => {
      this.syncData();
    });
  }

  private syncData() {
    this.isSyncing = true;
    this.loadOrders();
    this.loadStats();
    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }

  private loadOrders() {
    this.ordersSubscription = this.orderTrackingService.getOrders().subscribe({
      next: (orders) => {
        console.log('Toutes les commandes reçues:', orders);
        this.orders = orders
          .filter(order => order.status !== OrderStatus.LIVRE && order.status !== OrderStatus.ANNULE)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('Commandes filtrées (non livrées):', this.orders);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
      }
    });
  }

  private loadStats() {
    this.stats = this.orderTrackingService.getOrderStats();
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.statusUpdateNotes = order.notes || '';
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    this.orderTrackingService.updateOrderStatus(
      orderId, 
      status, 
      this.statusUpdateNotes.trim() || undefined
    );

    // Recharger les données pour mettre à jour l'affichage
    this.loadOrders();
    this.loadStats();
    
    // Notification de succès
    console.log(`Statut de la commande ${orderId} mis à jour vers: ${status}`);
  }

  getStatusInfo(status: OrderStatus) {
    return this.orderTrackingService.getStatusInfo(status);
  }

  getOrderProgress(status: OrderStatus): number {
    return this.orderTrackingService.getOrderProgress(status);
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  refreshOrders() {
    this.loading = true;
    this.syncData();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }



  getStatusClass(status: OrderStatus): string {
    const statusMap: { [key in OrderStatus]: string } = {
      [OrderStatus.EN_ATTENTE]: 'status-en-attente',
      [OrderStatus.EN_PREPARATION]: 'status-en-preparation',
      [OrderStatus.PRET]: 'status-pret',
      [OrderStatus.LIVRE]: 'status-livre',
      [OrderStatus.ANNULE]: 'status-annule'
    };
    return statusMap[status] || 'status-en-attente';
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

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} €`;
  }

  canUpdateToStatus(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const statusFlow = [
      OrderStatus.EN_ATTENTE,
      OrderStatus.EN_PREPARATION,
      OrderStatus.PRET,
      OrderStatus.LIVRE
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);
    const targetIndex = statusFlow.indexOf(targetStatus);

    return targetIndex === currentIndex + 1;
  }

  getAvailableActions(order: Order): OrderStatus[] {
    const statusFlow = [
      OrderStatus.EN_ATTENTE,
      OrderStatus.EN_PREPARATION,
      OrderStatus.PRET,
      OrderStatus.LIVRE
    ];

    const currentIndex = statusFlow.indexOf(order.status);
    const nextStatus = statusFlow[currentIndex + 1];

    return nextStatus ? [nextStatus] : [];
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
} 