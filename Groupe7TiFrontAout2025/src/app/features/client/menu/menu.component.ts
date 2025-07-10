import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // Mocktails data
  mocktails: Mocktail[] = [
    {
      id: 1,
      name: 'Virgin Mojito',
      description: 'Refreshing with fresh mint and lime',
      price: 8.50,
      available: true,
      image: '🍹',
      ingredients: [
        { name: 'Fresh mint', quantity: 5, unit: 'g' },
        { name: 'Lime', quantity: 20, unit: 'g' },
        { name: 'Sugar syrup', quantity: 1.5, unit: 'cl' },
        { name: 'Sparkling water', quantity: 20, unit: 'cl' }
      ]
    },
    {
      id: 2,
      name: 'Virgin Colada',
      description: 'Exotic with coconut and pineapple',
      price: 9.00,
      available: true,
      image: '🥤',
      ingredients: [
        { name: 'Pineapple juice', quantity: 15, unit: 'cl' },
        { name: 'Coconut milk', quantity: 8, unit: 'cl' },
        { name: 'Sugar syrup', quantity: 1, unit: 'cl' }
      ]
    },
    {
      id: 3,
      name: 'Sunset Spritz',
      description: 'Blood orange, grenadine and sparkling water',
      price: 7.50,
      available: false,
      image: '🌅',
      ingredients: [
        { name: 'Blood orange juice', quantity: 12, unit: 'cl' },
        { name: 'Grenadine', quantity: 3, unit: 'cl' },
        { name: 'Sparkling water', quantity: 10, unit: 'cl' }
      ]
    },
    {
      id: 4,
      name: 'Berry Fizz',
      description: 'Red berries, lemon and sparkling water',
      price: 8.00,
      available: true,
      image: '🍓',
      ingredients: [
        { name: 'Red berries', quantity: 8, unit: 'g' },
        { name: 'Lemon juice', quantity: 5, unit: 'cl' },
        { name: 'Sparkling water', quantity: 15, unit: 'cl' }
      ]
    },
    {
      id: 5,
      name: 'Tropical Dream',
      description: 'Mango, passion fruit and coconut milk',
      price: 9.20,
      available: true,
      image: '🥭',
      ingredients: [
        { name: 'Mango juice', quantity: 10, unit: 'cl' },
        { name: 'Passion fruit juice', quantity: 5, unit: 'cl' },
        { name: 'Coconut milk', quantity: 8, unit: 'cl' }
      ]
    },
    {
      id: 6,
      name: 'Green Detox',
      description: 'Cucumber, green apple and mint',
      price: 8.80,
      available: true,
      image: '🥒',
      ingredients: [
        { name: 'Cucumber', quantity: 10, unit: 'g' },
        { name: 'Green apple', quantity: 10, unit: 'g' },
        { name: 'Fresh mint', quantity: 3, unit: 'g' }
      ]
    },
    {
      id: 7,
      name: 'Pink Lemonade',
      description: 'Lemon, raspberry and agave syrup',
      price: 7.80,
      available: true,
      image: '🍋',
      ingredients: [
        { name: 'Lemon juice', quantity: 8, unit: 'cl' },
        { name: 'Raspberries', quantity: 6, unit: 'g' },
        { name: 'Agave syrup', quantity: 1.2, unit: 'cl' }
      ]
    }
  ];

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

  ngOnInit() {
    // Load cart from localStorage if available
    this.loadCartFromStorage();
  }

  ngOnDestroy() {
    // Save cart to localStorage
    this.saveCartToStorage();
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
  private saveCartToStorage() {
    try {
      localStorage.setItem('helha-fresh-cart', JSON.stringify(this.orderList));
    } catch (error) {
      console.warn('Unable to save cart:', error);
    }
  }

  private loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('helha-fresh-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Check that mocktails still exist
        this.orderList = parsedCart.filter((item: any) => 
          this.mocktails.find(m => m.id === item.mocktail.id)
        );
      }
    } catch (error) {
      console.warn('Unable to load cart:', error);
      this.orderList = [];
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
