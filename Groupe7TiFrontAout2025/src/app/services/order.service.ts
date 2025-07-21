import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, of, throwError } from "rxjs"
import { delay, tap } from "rxjs/operators"
import { Order, OrderItem, OrderStatus, Mocktail } from "../models/order" // Assurez-vous que le chemin est correct

@Injectable({
  providedIn: "root",
})
export class OrderService {
  // Simule une base de données d'ordres en mémoire
  private _orders: Order[] = []

  // Sujet pour les commandes actives (pour le manager)
  private ordersSubject = new BehaviorSubject<Order[]>(this._orders)
  public orders$: Observable<Order[]> = this.ordersSubject.asObservable()

  // Sujet pour la commande du client actuel (pour le client)
  private clientOrderSubject = new BehaviorSubject<Order | null>(null)
  public clientOrder$: Observable<Order | null> = this.clientOrderSubject.asObservable()

  constructor() {
    // Initialisation avec quelques commandes fictives pour le test
    this.initializeMockOrders()
  }

  private initializeMockOrders(): void {
    // Les mocktails ici doivent correspondre à la structure de Mocktail dans order.ts
    const mocktail1: Mocktail = {
      id: 1,
      name: "Sunset Spritz",
      description: "Fruity and refreshing",
      price: 7.5,
      image: "🌅",
      available: true,
      ingredients: [],
    }
    const mocktail2: Mocktail = {
      id: 2,
      name: "Tropical Breeze",
      description: "Exotic and sweet",
      price: 8.0,
      image: "🌴",
      available: true,
      ingredients: [],
    }

    const order1: Order = {
      id: "ORD001",
      tableNumber: 5,
      items: [{ mocktail: mocktail1, quantity: 2 }],
      total: 15.0,
      status: OrderStatus.PENDING,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    }

    const order2: Order = {
      id: "ORD002",
      tableNumber: 12,
      items: [
        { mocktail: mocktail2, quantity: 1 },
        { mocktail: mocktail1, quantity: 1 },
      ],
      total: 15.5,
      status: OrderStatus.PREPARING,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      updatedAt: new Date(Date.now() - 2 * 60 * 1000),
    }

    this._orders.push(order1, order2)
    this.ordersSubject.next([...this._orders])
  }

  // Méthode pour soumettre une nouvelle commande (côté client)
  submitOrder(items: OrderItem[], tableNumber: number): Observable<Order> {
    const newOrder: Order = {
      id: `ORD${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      tableNumber: tableNumber,
      items: items,
      total: items.reduce((sum, item) => sum + item.mocktail.price * item.quantity, 0),
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Simule un appel API avec un délai
    return of(newOrder).pipe(
      delay(1000), // Simule le temps de traitement du backend
      tap((order) => {
        this._orders.push(order)
        this.ordersSubject.next([...this._orders]) // Notifie tous les abonnés (manager)
        this.clientOrderSubject.next(order) // Notifie le client de sa commande
        console.log("Order submitted:", order)
      }),
    )
  }

  // Méthode pour mettre à jour le statut d'une commande (côté manager)
  updateOrderStatus(orderId: string, newStatus: OrderStatus): Observable<Order> {
    const orderIndex = this._orders.findIndex((o) => o.id === orderId)
    if (orderIndex > -1) {
      const updatedOrder = { ...this._orders[orderIndex], status: newStatus, updatedAt: new Date() }
      this._orders[orderIndex] = updatedOrder
      this.ordersSubject.next([...this._orders]) // Notifie tous les abonnés (manager)

      // Si c'est la commande du client actuel, mettez à jour aussi le sujet client
      if (this.clientOrderSubject.value?.id === orderId) {
        this.clientOrderSubject.next(updatedOrder)
      }
      console.log(`Order ${orderId} status updated to ${newStatus}`)
      return of(updatedOrder).pipe(delay(500)) // Simule le temps de traitement
    }
    return throwError(() => new Error("Order not found")) // Retourne une erreur observable si la commande n'est pas trouvée
  }

  // Méthode pour récupérer une commande spécifique (pour le client après soumission)
  getOrderById(orderId: string): Observable<Order | undefined> {
    return of(this._orders.find((order) => order.id === orderId)).pipe(delay(200))
  }

  // Méthode pour définir la commande du client actuel (par exemple, après un rafraîchissement de page)
  setClientOrder(order: Order | null): void {
    this.clientOrderSubject.next(order)
  }
}
