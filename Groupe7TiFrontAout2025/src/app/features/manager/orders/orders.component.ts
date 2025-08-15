import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OrderService, Order } from '../../../services/order.service';
import { TableService, TableDto } from '../../../services/table.service';

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

  // Filter
  statusFilter: 'ALL' | 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' = 'ALL';
  tableFilter: string = '';
  dateFilter: string = ''; // Pas de filtre par date par défaut pour voir toutes les commandes
  sortBy: 'date' | 'priority' = 'date';

  // Available tables
  availableTables: TableDto[] = [];

  // Current actions
  processingOrderId: number | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 15;
  paginatedOrders: Order[] = [];

  readonly STATUS_CONFIG: { [key: string]: OrderStatus } = {
    'PENDING': {
      status: 'PENDING',
      label: 'Pending',
      icon: '⏳',
      color: '#f59e0b',
      actionLabel: 'Start',
      nextStatus: 'IN_PREPARATION'
    },
    'IN_PREPARATION': {
      status: 'IN_PREPARATION',
      label: 'In Preparation',
      icon: '👨‍🍳',
      color: '#3b82f6',
      actionLabel: 'Mark Ready',
      nextStatus: 'READY'
    },
    'READY': {
      status: 'READY',
      label: 'Ready',
      icon: '✅',
      color: '#10b981',
      actionLabel: 'Deliver',
      nextStatus: 'DELIVERED'
    },
    'DELIVERED': {
      status: 'DELIVERED',
      label: 'Delivered',
      icon: '🎉',
      color: '#8b5cf6',
      actionLabel: 'Completed',
      nextStatus: null
    }
  };

  constructor(
    private orderService: OrderService,
    private tableService: TableService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.loadTables();
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

        // Normalize received data
        this.orders = response.sales.map(order => {
          const normalizedOrder = {
            ...order,
            status: this.orderService.normalizeStatus(order.status),
            items: this.orderService.normalizeItems(order.items)
          };
          return normalizedOrder;
        });

        this.applyFilters();

        // Force statistics update after loading
        this.triggerStatisticsUpdate();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Unable to load orders';
        this.isLoading = false;
      }
    });
  }

  private loadTables() {
    this.tableService.getAllTables().subscribe({
      next: (response) => {
        this.availableTables = response.tables;
      },
      error: (error) => {
        console.error('❌ Error loading tables:', error);
        // In case of error, we can continue without the tables
      }
    });
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      // Silent refresh without showing loading
      this.orderService.getAllOrders().subscribe({
        next: (response) => {
          // Normalize received data
          this.orders = response.sales.map(order => {
            const normalizedOrder = {
              ...order,
              status: this.orderService.normalizeStatus(order.status),
              items: this.orderService.normalizeItems(order.items)
            };
            return normalizedOrder;
          });

          // Apply filters without reloading the interface
          this.applyFilters();

          // Force statistics update after auto refresh
          this.triggerStatisticsUpdate();
        },
        error: (error) => {
          console.error('Error during silent refresh:', error);
        }
      });
    }, 30000); // Refresh every 30 seconds
  }

  private applyFilters() {
    let filtered = [...this.orders];

    // Filter by date
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.saleDate);
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by status
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Filter by table
    if (this.tableFilter.trim()) {
      filtered = filtered.filter(order =>
        order.tableNumber === this.tableFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
      } else {
        // Sort by priority (oldest first)
        return new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
      }
    });

    this.filteredOrders = filtered;

    // Apply pagination
    this.applyPagination();
  }

  onStatusFilterChange() {
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  onTableFilterChange() {
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  onDateFilterChange() {
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  onSortChange() {
    this.currentPage = 1; // Reset to first page when filter changes
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
        this.showToast(`Order #${order.id}: ${config.actionLabel}`, 'success');

        // Update the order status locally for immediate UI feedback
        const orderToUpdate = this.orders.find(o => o.id === order.id);
        if (orderToUpdate && config.nextStatus) {
          orderToUpdate.status = config.nextStatus;

          // Force statistics update
          this.triggerStatisticsUpdate();

          // Reapply filters to update the filtered list
          this.applyFilters();
        }

        this.processingOrderId = null;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showToast('Error updating status', 'error');
        this.processingOrderId = null;
      }
    });
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
    if (items.length === 0) return 'No articles';
    if (items.length === 1) return items[0].mocktailName;
    return `${items[0].mocktailName} +${items.length - 1} other(s)`;
  }

  getTotalItems(items: any[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  refreshOrders() {
    this.loadOrders();
  }

  private showToast(message: string, type: 'success' | 'error') {
    // Simple toast implementation - can be improved with a dedicated service
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
    const count = this.orders.filter(order => order.status !== 'DELIVERED').length;
    return count;
  }

  getOrdersByStatus(status: string): number {
    const count = this.orders.filter(order => order.status === status).length;
    return count;
  }

  // Methods for filtered statistics (if needed)
  getFilteredActiveOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status !== 'DELIVERED').length;
  }

  getFilteredOrdersByStatus(status: string): number {
    return this.filteredOrders.filter(order => order.status === status).length;
  }

  // Force Angular to detect changes in statistics
  private triggerStatisticsUpdate() {
    // Force change detection by triggering a small change
    setTimeout(() => {
      // This will trigger Angular's change detection
      this.orders = [...this.orders];
    }, 0);
  }

  // Pagination methods
  private applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    // Show max 5 pages numbers around current page
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.getTotalPages());
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  canGoToPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  canGoToNextPage(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  getPaginationInfo(): string {
    const totalPages = this.getTotalPages();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredOrders.length);

    if (this.filteredOrders.length === 0) {
      return 'No orders found';
    }

    return `Showing ${startIndex}-${endIndex} of ${this.filteredOrders.length} orders`;
  }
}
