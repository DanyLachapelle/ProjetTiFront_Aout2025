import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { Order, OrderStatus, OrderStatusInfo, OrderItem, OrderStats } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {
  private orders = new BehaviorSubject<Order[]>([]);
  private currentUserOrder = new BehaviorSubject<Order | null>(null);
  private refreshInterval = timer(0, 10000); // Synchronisation toutes les 10 secondes

  constructor() {
    this.loadOrdersFromStorage();
    this.loadCurrentUserOrder();
  }

  // Getters pour les observables
  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  getCurrentUserOrder(): Observable<Order | null> {
    return this.currentUserOrder.asObservable();
  }

  // Chargement des données depuis le localStorage
  private loadOrdersFromStorage() {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('mocktail_orders');
      if (storedOrders) {
        const orders = JSON.parse(storedOrders).map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          // S'assurer que tableNumber existe, sinon utiliser une valeur par défaut
          tableNumber: order.tableNumber || Math.floor(Math.random() * 20) + 1
        }));
        this.orders.next(orders);
      }
    }
  }

  private loadCurrentUserOrder() {
    if (typeof window !== 'undefined') {
      const tableNumber = localStorage.getItem('table_number');
      if (tableNumber) {
        const currentOrders = this.orders.value;
        const userOrder = currentOrders.find(order => 
          order.tableNumber === parseInt(tableNumber) && 
          order.status !== OrderStatus.LIVRE && 
          order.status !== OrderStatus.ANNULE
        );
        this.currentUserOrder.next(userOrder || null);
      }
    }
  }

  // Sauvegarde des données dans le localStorage
  private saveOrdersToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mocktail_orders', JSON.stringify(this.orders.value));
    }
  }

  // Création d'une nouvelle commande
  createOrder(tableNumber: number, items: OrderItem[], sessionId?: string): Order {
    const newOrder: Order = {
      id: this.generateOrderId(),
      tableNumber,
      status: OrderStatus.EN_ATTENTE,
      items,
      totalAmount: items.reduce((total, item) => total + item.totalPrice, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTime: this.calculateEstimatedTime(items),
      sessionId
    };

    console.log('Service: Création de commande', { tableNumber, sessionId, orderId: newOrder.id });

    const currentOrders = this.orders.value;
    currentOrders.push(newOrder);
    this.orders.next(currentOrders);
    this.saveOrdersToStorage();

    // Si c'est la commande de l'utilisateur actuel
    if (sessionId) {
      this.currentUserOrder.next(newOrder);
      console.log('Service: Commande utilisateur actuel mise à jour');
    }

    return newOrder;
  }



  // Mise à jour du statut d'une commande
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): void {
    const currentOrders = this.orders.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      currentOrders[orderIndex] = {
        ...currentOrders[orderIndex],
        status,
        updatedAt: new Date(),
        notes: notes || currentOrders[orderIndex].notes
      };

      this.orders.next(currentOrders);
      this.saveOrdersToStorage();
      this.loadCurrentUserOrder(); // Recharger la commande utilisateur si nécessaire
    }
  }

  // Récupération d'une commande par ID
  getOrderById(orderId: string): Order | null {
    return this.orders.value.find(order => order.id === orderId) || null;
  }

  // Récupération des commandes par statut
  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.value.filter(order => order.status === status);
  }

  // Récupération des commandes non livrées
  getActiveOrders(): Order[] {
    return this.orders.value.filter(order => 
      order.status !== OrderStatus.LIVRE && 
      order.status !== OrderStatus.ANNULE
    );
  }

  // Calcul du temps estimé basé sur les items
  private calculateEstimatedTime(items: OrderItem[]): number {
    const baseTime = 3; // 3 minutes de base
    const timePerItem = 2; // 2 minutes par item
    return baseTime + (items.length * timePerItem);
  }

  // Génération d'un ID unique pour la commande
  private generateOrderId(): string {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Informations sur les statuts
  getStatusInfo(status: OrderStatus): OrderStatusInfo {
    const statusMap: { [key in OrderStatus]: OrderStatusInfo } = {
      [OrderStatus.EN_ATTENTE]: {
        label: 'En attente',
        icon: '⏳',
        color: '#FFA500',
        description: 'Votre commande a été reçue et est en attente de préparation',
        progress: 25,
        estimatedTime: 15,
        encouragingMessage: 'Votre commande est enregistrée ! Nos barmans vont s\'en occuper très vite.'
      },
      [OrderStatus.EN_PREPARATION]: {
        label: 'En préparation',
        icon: '🍹',
        color: '#0066CC',
        description: 'Vos mocktails sont en cours de préparation',
        progress: 50,
        estimatedTime: 10,
        encouragingMessage: 'Nos barmans préparent vos délicieux mocktails avec soin !'
      },
      [OrderStatus.PRET]: {
        label: 'Prêt',
        icon: '✅',
        color: '#00CC00',
        description: 'Vos mocktails sont prêts et attendent d\'être servis',
        progress: 75,
        estimatedTime: 2,
        encouragingMessage: 'Vos mocktails sont prêts ! Ils arrivent à votre table.'
      },
      [OrderStatus.LIVRE]: {
        label: 'Livré',
        icon: '🎉',
        color: '#00AA00',
        description: 'Vos mocktails ont été livrés à votre table',
        progress: 100,
        estimatedTime: 0,
        encouragingMessage: 'Bon appétit ! Profitez de vos délicieux mocktails !'
      },
      [OrderStatus.ANNULE]: {
        label: 'Annulé',
        icon: '❌',
        color: '#CC0000',
        description: 'Cette commande a été annulée',
        progress: 0,
        estimatedTime: 0,
        encouragingMessage: 'Cette commande a été annulée. Contactez le personnel si nécessaire.'
      }
    };

    return statusMap[status];
  }

  // Calcul du progrès d'une commande
  getOrderProgress(status: OrderStatus): number {
    return this.getStatusInfo(status).progress;
  }

  // Calcul du temps restant estimé
  getEstimatedTimeRemaining(order: Order): string {
    const statusInfo = this.getStatusInfo(order.status);
    if (statusInfo.estimatedTime === 0) return 'Livré';
    
    const minutes = statusInfo.estimatedTime;
    if (minutes < 1) return 'Quelques secondes';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  }

  // Message d'encouragement contextuel
  getEncouragingMessage(order: Order): string {
    return this.getStatusInfo(order.status).encouragingMessage;
  }

  // Statistiques des commandes
  getOrderStats(): OrderStats {
    const orders = this.orders.value;
    return {
      enAttente: orders.filter(o => o.status === OrderStatus.EN_ATTENTE).length,
      enPreparation: orders.filter(o => o.status === OrderStatus.EN_PREPARATION).length,
      pret: orders.filter(o => o.status === OrderStatus.PRET).length,
      livre: orders.filter(o => o.status === OrderStatus.LIVRE).length,
      total: orders.length
    };
  }

  // Nettoyage des données de test
  clearAllData(): void {
    this.orders.next([]);
    this.currentUserOrder.next(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mocktail_orders');
      localStorage.removeItem('table_number');
      localStorage.removeItem('current-order');
      localStorage.removeItem('current_order');
      localStorage.removeItem('helha-fresh-cart');
    }
    console.log('Toutes les données ont été nettoyées');
  }

  // Nettoyage de la commande utilisateur actuel
  clearCurrentUserOrder(): void {
    this.currentUserOrder.next(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_order');
    }
  }

  // Rafraîchissement automatique
  startAutoRefresh(): Observable<number> {
    return this.refreshInterval;
  }
} 