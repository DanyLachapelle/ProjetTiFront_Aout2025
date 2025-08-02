import {Component, OnInit, OnDestroy, NgIterable} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MocktailService} from '../../../services/mocktail.service';
import {SaleService} from '../../../services/sale.service';
import { Router } from '@angular/router';
import { SessionService, SessionData } from '../../../services/session.service';
import { OrderTrackingService } from '../../../services/order-tracking.service';
import { Order, OrderItem as TrackingOrderItem, OrderStatus } from '../../../models/order';


interface Mocktail {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

interface Ingredient {
  id: string;
  name: string;
}

interface OrderItem {
  mocktail: Mocktail;
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {


  // Mocktails data
  // mocktails: Mocktail[] = [
  //   {
  //     id: 1,
  //     name: 'Virgin Mojito',
  //     description: 'Refreshing with fresh mint and lime',
  //     price: 8.50,
  //     available: true,
  //     image: '🍹',
  //     ingredients: [
  //       { name: 'Fresh mint', quantity: 5, unit: 'g' },
  //       { name: 'Lime', quantity: 20, unit: 'g' },
  //       { name: 'Sugar syrup', quantity: 1.5, unit: 'cl' },
  //       { name: 'Sparkling water', quantity: 20, unit: 'cl' }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: 'Virgin Colada',
  //     description: 'Exotic with coconut and pineapple',
  //     price: 9.00,
  //     available: true,
  //     image: '🥤',
  //     ingredients: [
  //       { name: 'Pineapple juice', quantity: 15, unit: 'cl' },
  //       { name: 'Coconut milk', quantity: 8, unit: 'cl' },
  //       { name: 'Sugar syrup', quantity: 1, unit: 'cl' }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: 'Sunset Spritz',
  //     description: 'Blood orange, grenadine and sparkling water',
  //     price: 7.50,
  //     available: false,
  //     image: '🌅',
  //     ingredients: [
  //       { name: 'Blood orange juice', quantity: 12, unit: 'cl' },
  //       { name: 'Grenadine', quantity: 3, unit: 'cl' },
  //       { name: 'Sparkling water', quantity: 10, unit: 'cl' }
  //     ]
  //   },
  //   {
  //     id: 4,
  //     name: 'Berry Fizz',
  //     description: 'Red berries, lemon and sparkling water',
  //     price: 8.00,
  //     available: true,
  //     image: '🍓',
  //     ingredients: [
  //       { name: 'Red berries', quantity: 8, unit: 'g' },
  //       { name: 'Lemon juice', quantity: 5, unit: 'cl' },
  //       { name: 'Sparkling water', quantity: 15, unit: 'cl' }
  //     ]
  //   },
  //   {
  //     id: 5,
  //     name: 'Tropical Dream',
  //     description: 'Mango, passion fruit and coconut milk',
  //     price: 9.20,
  //     available: true,
  //     image: '🥭',
  //     ingredients: [
  //       { name: 'Mango juice', quantity: 10, unit: 'cl' },
  //       { name: 'Passion fruit juice', quantity: 5, unit: 'cl' },
  //       { name: 'Coconut milk', quantity: 8, unit: 'cl' }
  //     ]
  //   },
  //   {
  //     id: 6,
  //     name: 'Green Detox',
  //     description: 'Cucumber, green apple and mint',
  //     price: 8.80,
  //     available: true,
  //     image: '🥒',
  //     ingredients: [
  //       { name: 'Cucumber', quantity: 10, unit: 'g' },
  //       { name: 'Green apple', quantity: 10, unit: 'g' },
  //       { name: 'Fresh mint', quantity: 3, unit: 'g' }
  //     ]
  //   },
  //   {
  //     id: 7,
  //     name: 'Pink Lemonade',
  //     description: 'Lemon, raspberry and agave syrup',
  //     price: 7.80,
  //     available: true,
  //     image: '🍋',
  //     ingredients: [
  //       { name: 'Lemon juice', quantity: 8, unit: 'cl' },
  //       { name: 'Raspberries', quantity: 6, unit: 'g' },
  //       { name: 'Agave syrup', quantity: 1.2, unit: 'cl' }
  //     ]
  //   }
  // ];
  mocktails: Mocktail[] = []; // Remplace le tableau statique
  // --- Cart and modals management ---
  showOrderModal = false;
  selectedMocktail: Mocktail | null = null;
  selectedQuantity = 1;
  orderList: OrderItem[] = [];
  isLoading = true;
  // Animations and states
  isAddingToCart = false;
  cartAnimation = false;

  // Validation
  readonly MAX_QUANTITY = 10;
  readonly MIN_QUANTITY = 1;

  // Session management
  sessionData: SessionData | null = null;
  remainingTime = '15:00';
  private timerInterval: any;
  private sessionTimeSeconds = 15 * 60; // 15 minutes en secondes

  // Méthode pour formater le temps en MM:SS
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Suivi de commande
  currentOrder: Order | null = null;
  hasActiveOrder = false;

  constructor(
    private mocktailService: MocktailService,
    private router: Router,
    private sessionService: SessionService,
    private orderTrackingService: OrderTrackingService,
    private saleService: SaleService
  ) {}

  // ngOnInit() {
  //   // Load cart from localStorage if available
  //   this.loadCartFromStorage();
  // }
  ngOnInit() {
    // Charger le timer depuis localStorage ou démarrer à 15 minutes
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTime = localStorage.getItem('menu-timer');
      if (savedTime) {
        this.sessionTimeSeconds = parseInt(savedTime);
        if (this.sessionTimeSeconds <= 0) {
          this.router.navigate(['/']);
          return;
        }
      } else {
        this.sessionTimeSeconds = 15 * 60; // 15 minutes
      }
    } else {
      this.sessionTimeSeconds = 15 * 60; // 15 minutes
    }

    this.remainingTime = this.formatTime(this.sessionTimeSeconds);

    // Démarrer le timer immédiatement
    this.startSimpleTimer();

    // Load data from API
    this.loadMocktails();
    //this.loadIngredients();

    // Load cart from localStorage if available
    this.loadCartFromStorage();

    // Vérifier s'il y a une commande active
    this.checkActiveOrder();
  }
  // ngOnDestroy() {
  //   // Save cart to localStorage
  //   this.loadMocktails();
  //   this.loadCartFromStorage()
  // }


  ngOnDestroy() {
    // Save cart to localStorage
    this.saveCartToStorage();

    // Nettoyer le timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Sauvegarder le temps restant avant de quitter
    if (this.sessionTimeSeconds > 0 && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('menu-timer', this.sessionTimeSeconds.toString());
    }
  }

  // Méthode simple inspirée du code React
  private startSimpleTimer(): void {
    this.timerInterval = setInterval(() => {
      this.sessionTimeSeconds = this.sessionTimeSeconds - 1;
      this.remainingTime = this.formatTime(this.sessionTimeSeconds);

      // Sauvegarder le temps restant dans localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('menu-timer', this.sessionTimeSeconds.toString());
      }

      if (this.sessionTimeSeconds <= 0) {
        clearInterval(this.timerInterval);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('menu-timer'); // Nettoyer localStorage
        }
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  // Méthodes pour la session
  getTableNumber(): string {
    // Récupérer le numéro de table depuis localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const tableNumber = localStorage.getItem('table_number');
      //console.log('Numéro de table récupéré:', tableNumber);
      return tableNumber || 'T01';
    }
    return 'T01';
  }

  getFormattedRemainingTime(): string {
    return this.sessionService.formatRemainingTime();
  }


  loadMocktails() {
    this.isLoading = true;
    this.mocktailService.getAll().subscribe({
      next: (mocktails) => {
        this.mocktails = mocktails;
        this.extractAllIngredients();
        this.filterMocktails();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading mocktails:', error);
        this.isLoading = false;
      }
    });
  }

  // --- Cart management ---
  openOrderModal(mocktail: Mocktail) {
    if (!mocktail.available) return;

    this.selectedMocktail = mocktail;
    this.selectedQuantity = 1;
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedMocktail = null;
    this.selectedQuantity = 1;
  }

  addToOrder() {
    if (!this.selectedMocktail || this.selectedQuantity < this.MIN_QUANTITY) return;

    // Add to cart animation
    this.isAddingToCart = true;

    // Check if mocktail is already in the list
    const found = this.orderList.find(item => item.mocktail.id === this.selectedMocktail!.id);
    if (found) {
      found.quantity += this.selectedQuantity;
    } else {
      this.orderList.push({
        mocktail: this.selectedMocktail,
        quantity: this.selectedQuantity
      });
    }

    // Cart animation
    this.cartAnimation = true;
    setTimeout(() => {
      this.cartAnimation = false;
    }, 300);

    // Save to localStorage
    this.saveCartToStorage();

    this.closeOrderModal();

    // Reset animation
    setTimeout(() => {
      this.isAddingToCart = false;
    }, 500);
  }

  getOrderTotal(): number {
    return this.orderList.reduce((sum, item) => sum + item.mocktail.price * item.quantity, 0);
  }

  clearOrder() {
    if (this.orderList.length === 0) return;

    if (confirm('Are you sure you want to empty your cart?')) {
      this.orderList = [];
      this.saveCartToStorage();
    }
  }

  removeOrderItem(id: number) {
    this.orderList = this.orderList.filter(item => item.mocktail.id !== id);
    this.saveCartToStorage();
  }

  increaseQuantity(item: OrderItem) {
    if (item.quantity < this.MAX_QUANTITY) {
      item.quantity++;
      this.saveCartToStorage();
    }
  }

  decreaseQuantity(item: OrderItem) {
    if (item.quantity > this.MIN_QUANTITY) {
      item.quantity--;
      this.saveCartToStorage();
    }
  }

  // --- Modal management ---
  showFullOrderModal = false;

  openFullOrderModal() {
    if (this.orderList.length === 0) return;

    this.showFullOrderModal = true;
  }

  closeFullOrderModal() {
    this.showFullOrderModal = false;
  }

  // --- Quantity validation ---
  onQuantityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);

    if (isNaN(value) || value < this.MIN_QUANTITY) {
      value = this.MIN_QUANTITY;
    } else if (value > this.MAX_QUANTITY) {
      value = this.MAX_QUANTITY;
    }

    this.selectedQuantity = value;
    input.value = value.toString();
  }

  // --- Cart persistence ---
  private saveCartToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('helha-fresh-cart', JSON.stringify(this.orderList));
    }
  }

  private loadCartFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('helha-fresh-cart');
      if (savedCart) {
        try {
          this.orderList = JSON.parse(savedCart);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          this.orderList = [];
        }
      }
    }
  }

  // --- Utilities ---
  getOrderItemCount(): number {
    return this.orderList.reduce((sum, item) => sum + item.quantity, 0);
  }

  isCartEmpty(): boolean {
    return this.orderList.length === 0;
  }

  // --- Quit button management ---
  onQuit() {
    if (this.orderList.length > 0) {
      if (confirm('You have items in your cart. Do you really want to quit?')) {
        this.clearOrder();
        // Here we could redirect to another page
        console.log('Quit menu');
      }
    } else {
      // Here we could redirect to another page
      console.log('Quit menu');
    }
  }

  // --- Payment management ---
  onPay() {
    if (this.orderList.length === 0 || this.getOrderTotal() <= 0) return;

    // Affiche une alerte de traitement du paiement
    alert(`Paiement de ${this.getOrderTotal().toFixed(2)} € en cours...`);

    setTimeout(() => {
      this.saleService.createSale().subscribe({
        next: sale => {
          const saleId = sale.id;

          const itemRequests = this.orderList.map(item =>
            this.saleService.addItemToSale({
              saleId: saleId,
              mocktailId: item.mocktail.id,
              quantity: item.quantity
            }).toPromise()
          );

          Promise.all(itemRequests).then(() => {
            alert('Paiement réussi ! Commande enregistrée.');
            this.orderList = [];
            this.saveCartToStorage();
            this.closeFullOrderModal();
          }).catch(err => {
            console.error('Erreur en ajoutant les items :', err);
            alert('Erreur pendant l’enregistrement de la commande.');
          });
        },
        error: err => {
          console.error('Erreur création vente :', err);
          alert('Impossible de créer la vente.');
        }
      });
    }, 2000); // Délai de 2 secondes simulant un paiement
  }

  // Méthodes pour le suivi de commande
  allIngredients: string[] = [];
  excludedIngredients: string[] = [];

  filteredMocktails: Mocktail[] = [];
  expandedMocktailId: any;

  checkActiveOrder() {
    this.orderTrackingService.getCurrentUserOrder().subscribe(order => {
      this.currentOrder = order;
      this.hasActiveOrder = order !== null &&
        order.status !== OrderStatus.LIVRE &&
        order.status !== OrderStatus.ANNULE;
    });
  }

  goToOrderTracking() {
    this.router.navigate(['/order-tracking']);
  }

  clearAllergenFilters() {
    this.excludedIngredients = [];
    this.filterMocktails();
  }

  isIngredientExcluded(ingredientName: string): boolean {
    return this.excludedIngredients.includes(ingredientName);
  }

  // --- Allergen filtering ---
  toggleExcludedIngredient(ingredientName: string) {
    const index = this.excludedIngredients.indexOf(ingredientName);
    if (index > -1) {
      this.excludedIngredients.splice(index, 1);
    } else {
      this.excludedIngredients.push(ingredientName);
    }
    this.filterMocktails();
  }

  private extractAllIngredients() {
    const ingredientSet = new Set<string>();
    this.mocktails.forEach(mocktail => {
      mocktail.ingredients.forEach(ingredient => {
        // ici on prend juste le nom de l'ingrédient,
        // tu peux adapter si tu as un champ allergène spécifique
        ingredientSet.add(ingredient.name.trim());
      });
    });
    this.allIngredients = Array.from(ingredientSet).sort();
  }

// --- Ingredients display ---
  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
  }


  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Check if mocktail contains excluded ingredients
      const hasExcludedIngredient = this.excludedIngredients.some(excludedIngredient =>
        mocktail.ingredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(excludedIngredient.toLowerCase())
        )
      );

      return !hasExcludedIngredient;
    });
  }

  // --- Modal quantity controls ---
  decreaseModalQuantity() {
    if (this.selectedQuantity > this.MIN_QUANTITY) {
      this.selectedQuantity--;
    }
  }

  increaseModalQuantity() {
    if (this.selectedQuantity < this.MAX_QUANTITY) {
      this.selectedQuantity++;
    }
  }

}
