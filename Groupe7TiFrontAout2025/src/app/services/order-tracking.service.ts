import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '../models/order';

export interface OrderStatusInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  estimatedTime: number;
  encouragingMessage: string;
}

export interface OrderStats {
  total: number;
  enAttente: number;
  enPreparation: number;
  pret: number;
  livre: number;
}

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

  // Nouvelle méthode pour récupérer toutes les commandes actives d'une table
  getCurrentUserOrders(): Observable<Order[]> {
    return new Observable(observer => {
      if (typeof window !== 'undefined') {
        const tableNumber = localStorage.getItem('table_number');
        if (tableNumber) {
          const tableNum = parseInt(tableNumber.replace('T', ''));
          const currentOrders = this.orders.value;
          
          // Trouver toutes les commandes actives pour cette table
          const userOrders = currentOrders.filter(order => 
            order.tableNumber === tableNum && 
            order.status !== OrderStatus.LIVRE && 
            order.status !== OrderStatus.ANNULE
          );
          
          // Trier par date de création (plus récent en premier)
          userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          observer.next(userOrders);
        } else {
          observer.next([]);
        }
      } else {
        observer.next([]);
      }
      observer.complete();
    });
  }

  // Méthode pour récupérer l'historique des commandes livrées
  getOrderHistory(): Observable<Order[]> {
    return new Observable(observer => {
      if (typeof window !== 'undefined') {
        const tableNumber = localStorage.getItem('table_number');
        if (tableNumber) {
          const tableNum = parseInt(tableNumber.replace('T', ''));
          const currentOrders = this.orders.value;
          
          // Trouver toutes les commandes livrées pour cette table
          const deliveredOrders = currentOrders.filter(order => 
            order.tableNumber === tableNum && 
            order.status === OrderStatus.LIVRE
          );
          
          // Trier par date de livraison (plus récent en premier)
          deliveredOrders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          
          observer.next(deliveredOrders);
        } else {
          observer.next([]);
        }
      } else {
        observer.next([]);
      }
      observer.complete();
    });
  }

  // Obtenir la clé de stockage pour une table spécifique
  private getTableStorageKey(tableNumber: number): string {
    return `mocktail_orders_table_${tableNumber}`;
  }

  // Obtenir la clé de stockage pour la commande actuelle d'une table
  private getCurrentOrderStorageKey(tableNumber: number): string {
    return `current_order_table_${tableNumber}`;
  }

  // Chargement des données depuis le localStorage
  private loadOrdersFromStorage() {
    if (typeof window !== 'undefined') {
      // Charger toutes les commandes de toutes les tables
      const allOrders: Order[] = [];
      
      console.log('Service: Début du chargement des commandes depuis localStorage');
      
      // Parcourir toutes les clés localStorage pour trouver les commandes par table
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mocktail_orders_table_')) {
          try {
            const tableOrders = JSON.parse(localStorage.getItem(key) || '[]');
            console.log(`Service: Commandes trouvées pour la clé ${key}:`, tableOrders);
            allOrders.push(...tableOrders.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt)
            })));
          } catch (error) {
            console.error('Erreur lors du chargement des commandes pour la clé:', key, error);
          }
        }
      }
      
      console.log('Service: Toutes les commandes chargées:', allOrders);
      this.orders.next(allOrders);
    }
  }

  private loadCurrentUserOrder() {
    if (typeof window !== 'undefined') {
      const tableNumber = localStorage.getItem('table_number');
      if (tableNumber) {
        const tableNum = parseInt(tableNumber.replace('T', ''));
        const currentOrders = this.orders.value;
        
        // Trouver toutes les commandes actives pour cette table
        const userOrders = currentOrders.filter(order => 
          order.tableNumber === tableNum && 
          order.status !== OrderStatus.LIVRE && 
          order.status !== OrderStatus.ANNULE
        );
        
        // Prendre la commande la plus récente (la dernière créée)
        const userOrder = userOrders.length > 0 
          ? userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          : null;
          
        this.currentUserOrder.next(userOrder);
        console.log('Service: Commande utilisateur chargée:', userOrder);
      }
    }
  }

  // Sauvegarde des données dans le localStorage par table
  private saveOrdersToStorage() {
    if (typeof window !== 'undefined') {
      const allOrders = this.orders.value;
      
      // Grouper les commandes par table
      const ordersByTable = new Map<number, Order[]>();
      
      allOrders.forEach(order => {
        if (!ordersByTable.has(order.tableNumber)) {
          ordersByTable.set(order.tableNumber, []);
        }
        ordersByTable.get(order.tableNumber)!.push(order);
      });
      
      // Sauvegarder chaque groupe de commandes dans sa propre clé
      ordersByTable.forEach((orders, tableNumber) => {
        const storageKey = this.getTableStorageKey(tableNumber);
        localStorage.setItem(storageKey, JSON.stringify(orders));
      });
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

    // Sauvegarder la commande actuelle pour cette table
    if (typeof window !== 'undefined') {
      const currentOrderKey = this.getCurrentOrderStorageKey(tableNumber);
      localStorage.setItem(currentOrderKey, JSON.stringify(newOrder));
    }

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
      const updatedOrder = {
        ...currentOrders[orderIndex],
        status,
        updatedAt: new Date(),
        notes: notes || currentOrders[orderIndex].notes
      };

      currentOrders[orderIndex] = updatedOrder;
      this.orders.next(currentOrders);
      this.saveOrdersToStorage();

      // Si la commande est livrée, nettoyer la commande actuelle pour cette table
      if (status === OrderStatus.LIVRE) {
        this.clearCurrentOrderForTable(updatedOrder.tableNumber);
      }

      this.loadCurrentUserOrder(); // Recharger la commande utilisateur si nécessaire
    }
  }

  // Nettoyer la commande actuelle pour une table spécifique
  private clearCurrentOrderForTable(tableNumber: number): void {
    if (typeof window !== 'undefined') {
      const currentOrderKey = this.getCurrentOrderStorageKey(tableNumber);
      localStorage.removeItem(currentOrderKey);
      console.log(`Commande actuelle nettoyée pour la table ${tableNumber}`);
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
        description: 'Votre commande a été annulée',
        progress: 0,
        estimatedTime: 0,
        encouragingMessage: 'Votre commande a été annulée. N\'hésitez pas à passer une nouvelle commande.'
      }
    };
    return statusMap[status];
  }

  getOrderProgress(status: OrderStatus): number {
    return this.getStatusInfo(status).progress;
  }

  getEstimatedTimeRemaining(order: Order): string {
    const statusInfo = this.getStatusInfo(order.status);
    const remainingTime = Math.max(0, statusInfo.estimatedTime);
    return `${remainingTime} min`;
  }

  getEncouragingMessage(order: Order): string {
    return this.getStatusInfo(order.status).encouragingMessage;
  }

  getOrderStats(): OrderStats {
    const orders = this.orders.value;
    return {
      total: orders.length,
      enAttente: orders.filter(o => o.status === OrderStatus.EN_ATTENTE).length,
      enPreparation: orders.filter(o => o.status === OrderStatus.EN_PREPARATION).length,
      pret: orders.filter(o => o.status === OrderStatus.PRET).length,
      livre: orders.filter(o => o.status === OrderStatus.LIVRE).length
    };
  }

  // Nettoyage des données de test
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      // Supprimer toutes les clés liées aux commandes
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('mocktail_orders_table_') || 
                    key.startsWith('current_order_table_') ||
                    key === 'table_number' ||
                    key === 'table-number' ||
                    key === 'current-order' ||
                    key === 'current_order' ||
                    key === 'helha-fresh-cart')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Réinitialiser les observables
      this.orders.next([]);
      this.currentUserOrder.next(null);
      
      console.log('Toutes les données de suivi de commande ont été nettoyées');
    }
  }

  // Nettoyer les données pour une table spécifique
  clearTableData(tableNumber: number): void {
    if (typeof window !== 'undefined') {
      // Supprimer les commandes de cette table
      const currentOrders = this.orders.value;
      const filteredOrders = currentOrders.filter(order => order.tableNumber !== tableNumber);
      
      this.orders.next(filteredOrders);
      this.saveOrdersToStorage();
      
      // Supprimer les clés localStorage spécifiques à cette table
      const tableOrdersKey = this.getTableStorageKey(tableNumber);
      const currentOrderKey = this.getCurrentOrderStorageKey(tableNumber);
      
      localStorage.removeItem(tableOrdersKey);
      localStorage.removeItem(currentOrderKey);
      
      // Si c'est la table actuelle, nettoyer aussi la commande utilisateur
      const currentTable = localStorage.getItem('table_number');
      if (currentTable && parseInt(currentTable.replace('T', '')) === tableNumber) {
        this.currentUserOrder.next(null);
      }
      
      console.log(`Données nettoyées pour la table ${tableNumber}`);
    }
  }

  clearCurrentUserOrder(): void {
    this.currentUserOrder.next(null);
  }

  startAutoRefresh(): Observable<number> {
    return this.refreshInterval;
  }
} 