import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor() {}

  // Ajouter une notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-remove notification after duration
    if (notification.duration !== undefined) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, notification.duration);
    }
  }

  // Supprimer une notification
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  // Vider toutes les notifications
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  // Méthodes utilitaires pour différents types de notifications
  success(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration: number = 8000): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration: number = 4000): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Notification spécifique pour les changements de statut de commande
  orderStatusChanged(status: string, orderId: string): void {
    this.success(
      'Statut mis à jour',
      `La commande #${orderId} est maintenant ${status}`,
      4000
    );
  }

  // Notification pour les erreurs de commande
  orderError(message: string): void {
    this.error(
      'Erreur de commande',
      message,
      6000
    );
  }

  // Générer un ID unique
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 