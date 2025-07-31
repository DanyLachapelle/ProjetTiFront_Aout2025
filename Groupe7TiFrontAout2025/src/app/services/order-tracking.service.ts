import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, map } from 'rxjs';
import { Order, OrderStatus, OrderStatusUpdate, OrderItem } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {
  private orders = new BehaviorSubject<Order[]>([]);
  private currentUserOrder = new BehaviorSubject<Order | null>(null);
  
  // Auto-refresh every 5 seconds for better responsiveness
  private refreshInterval = timer(0, 5000);

  constructor() {
    // Only load from storage if we're in browser environment
    if (typeof window !== 'undefined') {
      this.loadOrdersFromStorage();
      // Start auto-refresh for real-time updates
      this.refreshInterval.subscribe(() => {
        this.syncOrders();
      });
    }
  }

  // Clear all test data
  clearAllData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('helha-fresh-orders');
      localStorage.removeItem('current-order-id');
    }
    this.orders.next([]);
    this.currentUserOrder.next(null);
  }

  // Create a new order
  createOrder(tableNumber: string, items: OrderItem[], total: number): Order {
    const order: Order = {
      id: this.generateOrderId(),
      tableNumber,
      items,
      total,
      status: OrderStatus.EN_ATTENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTime: this.calculateEstimatedTime(items),
      statusHistory: [{
        status: OrderStatus.EN_ATTENTE,
        timestamp: new Date(),
        estimatedTime: this.calculateEstimatedTime(items)
      }]
    };

    const currentOrders = this.orders.value;
    const updatedOrders = [...currentOrders, order];
    this.orders.next(updatedOrders);
    this.saveOrdersToStorage(updatedOrders);
    
    // Set as current user order
    this.setCurrentUserOrder(order.id);
    
    return order;
  }

  // Update order status (manager actions)
  updateOrderStatus(orderId: string, newStatus: OrderStatus): boolean {
    const currentOrders = this.orders.value;
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return false;

    const order = { ...currentOrders[orderIndex] };
    const now = new Date();
    
    // Update order
    order.status = newStatus;
    order.updatedAt = now;
    order.estimatedTime = this.getEstimatedTimeForStatus(newStatus, order.items);
    
    // Add to history
    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      estimatedTime: order.estimatedTime
    });

    // Update orders array
    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = order;
    
    this.orders.next(updatedOrders);
    this.saveOrdersToStorage(updatedOrders);
    
    // Update current user order if it's the same
    if (this.currentUserOrder.value?.id === orderId) {
      this.currentUserOrder.next(order);
    }
    
    return true;
  }

  // Get all orders (for manager)
  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  // Get active orders (not delivered)
  getActiveOrders(): Observable<Order[]> {
    return this.orders.pipe(
      map(orders => orders.filter(order => order.status !== OrderStatus.LIVRE))
    );
  }

  // Get current user's order
  getCurrentUserOrder(): Observable<Order | null> {
    return this.currentUserOrder.asObservable();
  }

  // Set current user order by ID
  setCurrentUserOrder(orderId: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('current-order-id', orderId);
    }
    this.loadCurrentUserOrder();
  }

  // Get order by ID
  getOrderById(orderId: string): Order | null {
    return this.orders.value.find(order => order.id === orderId) || null;
  }

  // Clear current user order
  clearCurrentUserOrder(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('current-order-id');
    }
    this.currentUserOrder.next(null);
  }

  // Get order progress percentage
  getOrderProgress(status: OrderStatus): number {
    switch (status) {
      case OrderStatus.EN_ATTENTE: return 25;
      case OrderStatus.EN_PREPARATION: return 50;
      case OrderStatus.PRET: return 75;
      case OrderStatus.LIVRE: return 100;
      default: return 0;
    }
  }

  // Get status display info
  getStatusInfo(status: OrderStatus): { label: string; icon: string; color: string } {
    switch (status) {
      case OrderStatus.EN_ATTENTE:
        return { label: 'En attente', icon: '⏳', color: '#f59e0b' };
      case OrderStatus.EN_PREPARATION:
        return { label: 'En préparation', icon: '👨‍🍳', color: '#3b82f6' };
      case OrderStatus.PRET:
        return { label: 'Prêt', icon: '✅', color: '#10b981' };
      case OrderStatus.LIVRE:
        return { label: 'Livré', icon: '🎉', color: '#8b5cf6' };
      default:
        return { label: 'Inconnu', icon: '❓', color: '#6b7280' };
    }
  }

  // Get next possible actions for manager
  getNextActions(status: OrderStatus): { action: string; nextStatus: OrderStatus; label: string }[] {
    switch (status) {
      case OrderStatus.EN_ATTENTE:
        return [{ action: 'start', nextStatus: OrderStatus.EN_PREPARATION, label: 'Commencer la préparation' }];
      case OrderStatus.EN_PREPARATION:
        return [{ action: 'ready', nextStatus: OrderStatus.PRET, label: 'Marquer comme prêt' }];
      case OrderStatus.PRET:
        return [{ action: 'deliver', nextStatus: OrderStatus.LIVRE, label: 'Livrer' }];
      case OrderStatus.LIVRE:
        return [];
      default:
        return [];
    }
  }

  // Calculate estimated time based on items
  private calculateEstimatedTime(items: OrderItem[]): number {
    const baseTime = 5; // 5 minutes base
    const itemTime = items.reduce((total, item) => total + (item.quantity * 2), 0); // 2 min per item
    return Math.min(baseTime + itemTime, 30); // Max 30 minutes
  }

  // Get estimated time for specific status
  private getEstimatedTimeForStatus(status: OrderStatus, items: OrderItem[]): number {
    switch (status) {
      case OrderStatus.EN_ATTENTE:
        return this.calculateEstimatedTime(items);
      case OrderStatus.EN_PREPARATION:
        return Math.max(this.calculateEstimatedTime(items) - 5, 5);
      case OrderStatus.PRET:
        return 2; // 2 minutes to deliver
      case OrderStatus.LIVRE:
        return 0;
      default:
        return 0;
    }
  }

  // Generate unique order ID
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  // Load orders from localStorage
  private loadOrdersFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedOrders = localStorage.getItem('helha-fresh-orders');
        if (savedOrders) {
          const orders: Order[] = JSON.parse(savedOrders);
          // Convert date strings back to Date objects
          orders.forEach(order => {
            order.createdAt = new Date(order.createdAt);
            order.updatedAt = new Date(order.updatedAt);
            order.statusHistory.forEach(h => h.timestamp = new Date(h.timestamp));
          });
          this.orders.next(orders);
        }
      } catch (error) {
        console.error('Error loading orders from storage:', error);
      }
    }
    this.loadCurrentUserOrder();
  }

  // Load current user order
  private loadCurrentUserOrder(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentOrderId = localStorage.getItem('current-order-id');
      if (currentOrderId) {
        const order = this.getOrderById(currentOrderId);
        this.currentUserOrder.next(order);
      }
    }
  }

  // Save orders to localStorage
  private saveOrdersToStorage(orders: Order[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('helha-fresh-orders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving orders to storage:', error);
      }
    }
  }

  // Sync orders (simulate real-time updates)
  private syncOrders(): void {
    // In a real app, this would fetch from a backend API
    // For now, we just reload from localStorage to simulate updates
    this.loadCurrentUserOrder();
  }

  // Get orders statistics for dashboard
  getOrderStats(): Observable<{ pending: number; preparing: number; ready: number; delivered: number }> {
    return this.orders.pipe(
      map(orders => ({
        pending: orders.filter(o => o.status === OrderStatus.EN_ATTENTE).length,
        preparing: orders.filter(o => o.status === OrderStatus.EN_PREPARATION).length,
        ready: orders.filter(o => o.status === OrderStatus.PRET).length,
        delivered: orders.filter(o => o.status === OrderStatus.LIVRE).length
      }))
    );
  }
} 