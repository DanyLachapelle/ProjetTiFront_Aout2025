import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MocktailService, Mocktail, Ingredient } from '../../../services/mocktail.service';

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

  constructor(private mocktailService: MocktailService) {}

  ngOnInit() {
    // Load data from API
    this.loadMocktails();
    this.loadIngredients();
    
    // Load cart from localStorage if available
    this.loadCartFromStorage();
  }

  ngOnDestroy() {
    // Save cart to localStorage
    this.saveCartToStorage();
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
