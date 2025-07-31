export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  ingredients?: string[];
}

export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  EN_PREPARATION = 'en_preparation',
  PRET = 'pret',
  LIVRE = 'livre'
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // in minutes
  notes?: string;
  // Timeline tracking
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    estimatedTime?: number;
  }[];
}

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: OrderStatus;
  estimatedTime?: number;
  timestamp: Date;
}

export interface OrderStatusInfo {
  label: string;
  icon: string;
  color: string;
  progress: number;
  estimatedTime?: number;
} 