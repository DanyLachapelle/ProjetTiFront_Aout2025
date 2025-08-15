import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';

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

  // Get all orders
  getAllOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetAllSales`).pipe(
      map(response => {
        return response;
      })
    );
  }

  // Get order by ID
  getOrderById(id: number): Observable<Order> {
    // First try to get the specific order by ID
    return this.http.get<Order>(`${this.baseUrl}/SaleQuery/GetSaleById?id=${id}`).pipe(
      map(order => {
        if (!order) {
          throw new Error(`Order with ID ${id} not found`);
        }
        return order;
      }),
      // If direct call fails, fallback to GetAllSales and filter
      catchError(() => {
        return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetAllSales`).pipe(
          map(response => {
            const order = response.sales.find(sale => sale.id === id);
            if (!order) {
              throw new Error(`Order with ID ${id} not found`);
            }
            return order;
          })
        );
      })
    );
  }

  // Get orders by date
  getOrdersByDate(date: string): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/SaleQuery/GetSalesByDate?date=${date}`);
  }

  // Advance order status (manager side)
  advanceOrderStatus(saleId: number): Observable<OrderStatusUpdate> {
    return this.http.post<OrderStatusUpdate>(`${this.baseUrl}/SaleCommand/AdvanceStatus/${saleId}`, {});
  }

  // Get non-delivered orders for manager dashboard
  getActiveOrders(): Observable<Order[]> {
    return this.getAllOrders().pipe(
      map(response => response.sales.filter(order => order.status !== 'DELIVERED'))
    );
  }

  // Get orders by status
  getOrdersByStatus(status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED'): Observable<Order[]> {
    return this.getAllOrders().pipe(
      map(response => response.sales.filter(order =>
        order.status === status || (status === 'PENDING' && order.status === 'Pending')
      ))
    );
  }

  // Normalize order status
  normalizeStatus(status: string): 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' {
    if (!status) return 'PENDING';

    // Normalize different variations of status strings
    const normalizedStatus = status.trim().toUpperCase();

    switch (normalizedStatus) {
      case 'PENDING':
      case 'Pending':
        return 'PENDING';
      case 'IN_PREPARATION':
      case 'IN PREPARATION':
      case 'PREPARATION':
        return 'IN_PREPARATION';
      case 'READY':
        return 'READY';
      case 'DELIVERED':
        return 'DELIVERED';
      default:
        console.warn('⚠️ Unknown status received:', status, 'defaulting to PENDING');
        return 'PENDING';
    }
  }

  // Normalize order items
  normalizeItems(items: any): OrderItem[] {
    if (!items || items === '' || items === ' ') return [];
    if (Array.isArray(items)) {
      return items.map(item => {
        // If item is a PowerShell string, try to parse it
        if (typeof item === 'string' && item.includes('@{')) {
          try {
            // Extract properties from PowerShell string
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
            console.warn('Error parsing item:', item, error);
          }
        }
        // If it's already an object, return it as is
        return item;
      });
    }
    return [];
  }
}
