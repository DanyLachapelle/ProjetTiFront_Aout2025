import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MocktailService, Mocktail, Ingredient } from '../../../services/mocktail.service';
import { Router } from '@angular/router';
import { SessionService, SessionData } from '../../../services/session.service';

interface OrderItem {
  mocktail: Mocktail;
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
  // Mocktails data - maintenant chargés depuis l'API
  mocktails: Mocktail[] = [];
  filteredMocktails: Mocktail[] = [];
  
  // Ingredients data
  ingredients: Ingredient[] = [];
  
  // Filters
  excludedIngredients: string[] = [];
  
  // Ingredients data
  allIngredients: string[] = [];
  
  // Expanded mocktail for ingredients display
  expandedMocktailId: number | null = null;

  // --- Cart and modals management ---
  showOrderModal = false;
  selectedMocktail: Mocktail | null = null;
  selectedQuantity = 1;
  orderList: OrderItem[] = [];
  
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

  constructor(
    private mocktailService: MocktailService, 
    private router: Router,
    private sessionService: SessionService
  ) {}

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
    this.loadIngredients();
    
    // Load cart from localStorage if available
    this.loadCartFromStorage();
  }

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
    // Récupérer le numéro de table depuis localStorage ou utiliser T01 par défaut
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('table-number') || 'T01';
    }
    return 'T01';
  }

  getFormattedRemainingTime(): string {
    return this.sessionService.formatRemainingTime();
  }

  // --- Load data from API ---
  loadMocktails() {
    this.mocktailService.getAll().subscribe({
      next: (data) => {
        this.mocktails = data;
        this.filterMocktails();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des mocktails:', error);
        this.mocktails = [];
        this.filteredMocktails = [];
      }
    });
  }

  loadIngredients() {
    this.mocktailService.getAllIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
        this.allIngredients = this.ingredients.map(ing => ing.name).sort();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ingrédients:', error);
        this.ingredients = [];
        this.allIngredients = [];
      }
    });
  }

  // --- Filtering ---
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

  isIngredientExcluded(ingredientName: string): boolean {
    return this.excludedIngredients.includes(ingredientName);
  }

  clearAllergenFilters() {
    this.excludedIngredients = [];
    this.filterMocktails();
  }

  // --- Ingredients display ---
  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
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
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  // --- Payment management ---
  onPay() {
    if (this.orderList.length === 0 || this.getOrderTotal() <= 0) return;
    
    // Here we could integrate a payment system
    alert(`Payment of €${this.getOrderTotal().toFixed(2)} in progress...`);
    
    // Successful payment simulation
    setTimeout(() => {
      alert('Payment successful! Your order has been recorded.');
      this.orderList = [];
      this.saveCartToStorage();
      this.closeFullOrderModal();
    }, 2000);
  }
}
