import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OrderService, Order } from '../../../services/order.service';

interface OrderStatus {
  status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'Pending';
  label: string;
  icon: string;
  color: string;
  actionLabel: string;
  nextStatus: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | null;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = true;
  error: string | null = null;
  private refreshInterval: any;

  // Filtres
  statusFilter: 'ALL' | 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' = 'ALL';
  tableFilter: string = '';
  dateFilter: string = new Date().toISOString().split('T')[0]; // Aujourd'hui par défaut
  sortBy: 'date' | 'priority' = 'date';

  // Actions en cours
  processingOrderId: number | null = null;

  readonly STATUS_CONFIG: { [key: string]: OrderStatus } = {
    'PENDING': {
      status: 'PENDING',
      label: 'En attente',
      icon: '⏳',
      color: '#f59e0b',
      actionLabel: 'Commencer',
      nextStatus: 'IN_PREPARATION'
    },
    'IN_PREPARATION': {
      status: 'IN_PREPARATION',
      label: 'En préparation',
      icon: '👨‍🍳',
      color: '#3b82f6',
      actionLabel: 'Marquer prêt',
      nextStatus: 'READY'
    },
    'READY': {
      status: 'READY',
      label: 'Prêt',
      icon: '✅',
      color: '#10b981',
      actionLabel: 'Livrer',
      nextStatus: 'DELIVERED'
    },
    'DELIVERED': {
      status: 'DELIVERED',
      label: 'Livré',
      icon: '🎉',
      color: '#8b5cf6',
      actionLabel: 'Terminé',
      nextStatus: null
    }
  };

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadOrders() {
    this.isLoading = true;
    this.error = null;

    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        console.log('📋 Réponse reçue dans OrdersComponent:', response);
        console.log('📋 Nombre de commandes reçues:', response.sales?.length || 0);
        
        // Normaliser les données reçues
        this.orders = response.sales.map(order => {
          const normalizedOrder = {
            ...order,
            status: this.orderService.normalizeStatus(order.status),
            items: this.orderService.normalizeItems(order.items)
          };
          console.log('🔄 Commande normalisée:', normalizedOrder);
          return normalizedOrder;
        });
        
        console.log('📋 Commandes après normalisation:', this.orders);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = 'Impossible de charger les commandes';
        this.isLoading = false;
      }
    });
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      // Rafraîchissement silencieux sans afficher le loading
      this.orderService.getAllOrders().subscribe({
        next: (response) => {
          // Normaliser les données reçues
          this.orders = response.sales.map(order => {
            const normalizedOrder = {
              ...order,
              status: this.orderService.normalizeStatus(order.status),
              items: this.orderService.normalizeItems(order.items)
            };
            return normalizedOrder;
          });
          
          // Appliquer les filtres sans recharger l'interface
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors du rafraîchissement silencieux:', error);
        }
      });
    }, 30000); // Rafraîchissement toutes les 30 secondes (plus discret)
  }

  private applyFilters() {
    let filtered = [...this.orders];

    // Filtre par date (commandes de la journée par défaut)
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.saleDate);
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtre par statut
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Filtre par table
    if (this.tableFilter.trim()) {
      filtered = filtered.filter(order => 
        order.tableNumber.toLowerCase().includes(this.tableFilter.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
      } else {
        // Tri par priorité (plus anciennes en premier)
        return new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
      }
    });

    this.filteredOrders = filtered;
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onTableFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  getStatusConfig(status: string): OrderStatus {
    return this.STATUS_CONFIG[status] || this.STATUS_CONFIG['PENDING'];
  }

  canAdvanceStatus(order: Order): boolean {
    const config = this.getStatusConfig(order.status);
    return config.nextStatus !== null;
  }

  advanceOrderStatus(order: Order) {
    if (this.processingOrderId === order.id) return;

    this.processingOrderId = order.id;
    const config = this.getStatusConfig(order.status);

    if (!config.nextStatus) {
      this.processingOrderId = null;
      return;
    }

    this.orderService.advanceOrderStatus(order.id).subscribe({
      next: (response) => {
        console.log(`Statut de la commande ${order.id} mis à jour: ${response.newStatus}`);
        this.showToast(`Commande #${order.id} : ${config.actionLabel}`, 'success');
        this.loadOrders(); // Recharger pour avoir les données à jour
        this.processingOrderId = null;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.showToast('Erreur lors de la mise à jour du statut', 'error');
        this.processingOrderId = null;
      }
    });
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

  getOrderAge(dateString: string): string {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ${diffMins % 60}min`;
    }
  }

  getOrderPriority(dateString: string): 'high' | 'medium' | 'low' {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins > 30) return 'high';
    if (diffMins > 15) return 'medium';
    return 'low';
  }

  getItemsSummary(items: any[]): string {
    if (items.length === 0) return 'Aucun article';
    if (items.length === 1) return items[0].mocktailName;
    return `${items[0].mocktailName} +${items.length - 1} autre(s)`;
  }

  getTotalItems(items: any[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  refreshOrders() {
    this.loadOrders();
  }

  private showToast(message: string, type: 'success' | 'error') {
    // Implémentation simple de toast - peut être améliorée avec un service dédié
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  getActiveOrdersCount(): number {
    return this.orders.filter(order => order.status !== 'DELIVERED').length;
  }

  getOrdersByStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }
}
