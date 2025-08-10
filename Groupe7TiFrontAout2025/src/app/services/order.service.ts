import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface OrderItem {
  id: number;
  mocktailId: number;
  mocktailName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Order {
  id: number;
  tableNumber: string;
  totalAmount: number;
  saleDate: string;
  status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'Pending';
  order_timer: number;
  items: OrderItem[];
}

export interface OrderStatusUpdate {
  saleId: number;
  newStatus: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED';
}

export interface OrdersResponse {
  sales: Order[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl || 'http://localhost:5201/api';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les commandes
  getAllOrders(): Observable<OrdersResponse> {
    console.log('🔍 Appel API getAllOrders vers:', `${this.baseUrl}/SaleQuery/GetAllSales`);
    return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetAllSales`).pipe(
      map(response => {
        console.log('📊 Réponse brute du backend:', response);
        return response;
      })
    );
  }

  // Récupérer une commande par ID
  getOrderById(id: number): Observable<Order> {
    console.log('🔍 Appel API getOrderById pour ID:', id);
    // Utiliser GetAllSales et filtrer par ID car GetSaleById ne retourne pas le status
    return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetAllSales`).pipe(
      map(response => {
        console.log('📊 Réponse brute getAllSales pour getOrderById:', response);
        const order = response.sales.find(sale => sale.id === id);
        if (!order) {
          throw new Error(`Commande avec l'ID ${id} non trouvée`);
        }
        console.log('📊 Commande trouvée par ID:', order);
        return order;
      })
    );
  }

  // Récupérer les commandes par date
  getOrdersByDate(date: string): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetSalesByDate?date=${date}`);
  }

  // Faire avancer le statut d'une commande (côté manager)
  advanceOrderStatus(saleId: number): Observable<OrderStatusUpdate> {
    return this.http.post<OrderStatusUpdate>(`${this.baseUrl}/SaleCommand/AdvanceStatus/${saleId}`, {});
  }

  // Récupérer les commandes non livrées pour le dashboard manager
  getActiveOrders(): Observable<Order[]> {
    return this.getAllOrders().pipe(
      map(response => response.sales.filter(order => order.status !== 'DELIVERED'))
    );
  }

  // Récupérer les commandes par statut
  getOrdersByStatus(status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED'): Observable<Order[]> {
    return this.getAllOrders().pipe(
      map(response => response.sales.filter(order => 
        order.status === status || (status === 'PENDING' && order.status === 'Pending')
      ))
    );
  }

  // Normaliser le statut d'une commande
  normalizeStatus(status: string): 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' {
    if (status === 'Pending') return 'PENDING';
    return status as 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED';
  }

  // Normaliser les items d'une commande
  normalizeItems(items: any): OrderItem[] {
    if (!items || items === '' || items === ' ') return [];
    if (Array.isArray(items)) {
      return items.map(item => {
        // Si l'item est une chaîne PowerShell, essayer de la parser
        if (typeof item === 'string' && item.includes('@{')) {
          try {
            // Extraire les propriétés de la chaîne PowerShell
            const itemStr = item.replace(/@{/g, '{').replace(/}/g, '}');
            const properties = itemStr.match(/(\w+)=([^;]+)/g);
            if (properties) {
              const itemObj: any = {};
              properties.forEach(prop => {
                const [key, value] = prop.split('=');
                itemObj[key.trim()] = value.trim();
              });
              return {
                id: parseInt(itemObj.id) || 0,
                mocktailId: parseInt(itemObj.mocktailId) || 0,
                mocktailName: itemObj.mocktailName || '',
                quantity: parseInt(itemObj.quantity) || 0,
                unitPrice: parseFloat(itemObj.unitPrice) || 0,
                itemTotal: parseFloat(itemObj.itemTotal) || 0
              };
            }
          } catch (error) {
            console.warn('Erreur lors du parsing de l\'item:', item, error);
          }
        }
        // Si c'est déjà un objet, le retourner tel quel
        return item;
      });
    }
    return [];
  }
}
