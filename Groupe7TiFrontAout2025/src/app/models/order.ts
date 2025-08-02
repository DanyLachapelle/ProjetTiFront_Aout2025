export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  EN_PREPARATION = 'en_preparation',
  PRET = 'pret',
  LIVRE = 'livre',
  ANNULE = 'annule'
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ingredients: string[];
}

export interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // en minutes
  notes?: string;
  sessionId?: string;
}

export interface OrderStatusInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  estimatedTime: number; // en minutes
  encouragingMessage: string;
}

export interface OrderStats {
  enAttente: number;
  enPreparation: number;
  pret: number;
  livre: number;
  total: number;
} 