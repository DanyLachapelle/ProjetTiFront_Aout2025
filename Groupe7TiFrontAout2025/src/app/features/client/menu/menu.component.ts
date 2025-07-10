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
  // Données pour les mocktails
  mocktails: Mocktail[] = [
    {
      id: 1,
      name: 'Mojito sans alcool',
      description: 'Rafraîchissant avec menthe fraîche et citron vert',
      price: 8.50,
      available: true,
      image: '🍹',
      ingredients: [
        { name: 'Menthe fraîche', quantity: 5, unit: 'g' },
        { name: 'Citron vert', quantity: 20, unit: 'g' },
        { name: 'Sirop de sucre', quantity: 1.5, unit: 'cl' },
        { name: 'Eau gazeuse', quantity: 20, unit: 'cl' }
      ]
    },
    {
      id: 2,
      name: 'Virgin Colada',
      description: 'Exotique avec noix de coco et ananas',
      price: 9.00,
      available: true,
      image: '🥤',
      ingredients: [
        { name: 'Jus d\'ananas', quantity: 15, unit: 'cl' },
        { name: 'Lait de coco', quantity: 8, unit: 'cl' },
        { name: 'Sirop de sucre', quantity: 1, unit: 'cl' }
      ]
    },
    {
      id: 3,
      name: 'Sunset Spritz',
      description: 'Orange sanguine, grenadine et eau gazeuse',
      price: 7.50,
      available: false,
      image: '🌅',
      ingredients: [
        { name: 'Jus d\'orange sanguine', quantity: 12, unit: 'cl' },
        { name: 'Grenadine', quantity: 3, unit: 'cl' },
        { name: 'Eau gazeuse', quantity: 10, unit: 'cl' }
      ]
    },
    {
      id: 4,
      name: 'Berry Fizz',
      description: 'Fruits rouges, citron et eau pétillante',
      price: 8.00,
      available: true,
      image: '🍓',
      ingredients: [
        { name: 'Fruits rouges', quantity: 8, unit: 'g' },
        { name: 'Jus de citron', quantity: 5, unit: 'cl' },
        { name: 'Eau pétillante', quantity: 15, unit: 'cl' }
      ]
    },
    {
      id: 5,
      name: 'Tropical Dream',
      description: 'Mangue, passion et lait de coco',
      price: 9.20,
      available: true,
      image: '🥭',
      ingredients: [
        { name: 'Jus de mangue', quantity: 10, unit: 'cl' },
        { name: 'Jus de fruit de la passion', quantity: 5, unit: 'cl' },
        { name: 'Lait de coco', quantity: 8, unit: 'cl' }
      ]
    },
    {
      id: 6,
      name: 'Green Detox',
      description: 'Concombre, pomme verte et menthe',
      price: 8.80,
      available: true,
      image: '🥒',
      ingredients: [
        { name: 'Concombre', quantity: 10, unit: 'g' },
        { name: 'Pomme verte', quantity: 10, unit: 'g' },
        { name: 'Menthe fraîche', quantity: 3, unit: 'g' }
      ]
    },
    {
      id: 7,
      name: 'Pink Lemonade',
      description: 'Citron, framboise et sirop d\'agave',
      price: 7.80,
      available: true,
      image: '🍋',
      ingredients: [
        { name: 'Jus de citron', quantity: 8, unit: 'cl' },
        { name: 'Framboises', quantity: 6, unit: 'g' },
        { name: 'Sirop d\'agave', quantity: 1.2, unit: 'cl' }
      ]
    }
  ];

  // --- Gestion du panier et des modals ---
  showOrderModal = false;
  selectedMocktail: Mocktail | null = null;
  selectedQuantity = 1;
  orderList: OrderItem[] = [];
  
  // Animations et états
  isAddingToCart = false;
  cartAnimation = false;

  // Validation
  readonly MAX_QUANTITY = 10;
  readonly MIN_QUANTITY = 1;

  ngOnInit() {
    // Charger le panier depuis le localStorage si disponible
    this.loadCartFromStorage();
  }

  ngOnDestroy() {
    // Sauvegarder le panier dans le localStorage
    this.saveCartToStorage();
  }

  // --- Gestion du panier ---
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
    
    // Animation d'ajout au panier
    this.isAddingToCart = true;
    
    // Chercher si le mocktail est déjà dans la liste
    const found = this.orderList.find(item => item.mocktail.id === this.selectedMocktail!.id);
    if (found) {
      found.quantity += this.selectedQuantity;
    } else {
      this.orderList.push({
        mocktail: this.selectedMocktail,
        quantity: this.selectedQuantity
      });
    }
    
    // Animation du panier
    this.cartAnimation = true;
    setTimeout(() => {
      this.cartAnimation = false;
    }, 300);
    
    // Sauvegarder dans le localStorage
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
    
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
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

  // --- Gestion des modals ---
  showFullOrderModal = false;

  openFullOrderModal() {
    if (this.orderList.length === 0) return;
    
    this.showFullOrderModal = true;
  }

  closeFullOrderModal() {
    this.showFullOrderModal = false;
  }

  // --- Validation de la quantité ---
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

  // --- Persistance du panier ---
  private saveCartToStorage() {
    try {
      localStorage.setItem('helha-fresh-cart', JSON.stringify(this.orderList));
    } catch (error) {
      console.warn('Impossible de sauvegarder le panier:', error);
    }
  }

  private loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('helha-fresh-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Vérifier que les mocktails existent toujours
        this.orderList = parsedCart.filter((item: any) => 
          this.mocktails.find(m => m.id === item.mocktail.id)
        );
      }
    } catch (error) {
      console.warn('Impossible de charger le panier:', error);
      this.orderList = [];
    }
  }

  // --- Utilitaires ---
  getOrderItemCount(): number {
    return this.orderList.reduce((sum, item) => sum + item.quantity, 0);
  }

  isCartEmpty(): boolean {
    return this.orderList.length === 0;
  }

  // --- Gestion du bouton Quitter ---
  onQuit() {
    if (this.orderList.length > 0) {
      if (confirm('Vous avez des articles dans votre panier. Voulez-vous vraiment quitter ?')) {
        this.clearOrder();
        // Ici on pourrait rediriger vers une autre page
        console.log('Quitter le menu');
      }
    } else {
      // Ici on pourrait rediriger vers une autre page
      console.log('Quitter le menu');
    }
  }

  // --- Gestion du paiement ---
  onPay() {
    if (this.orderList.length === 0 || this.getOrderTotal() <= 0) return;
    
    // Ici on pourrait intégrer un système de paiement
    alert(`Paiement de €${this.getOrderTotal().toFixed(2)} en cours...`);
    
    // Simulation de paiement réussi
    setTimeout(() => {
      alert('Paiement réussi ! Votre commande a été enregistrée.');
      this.orderList = [];
      this.saveCartToStorage();
      this.closeFullOrderModal();
    }, 2000);
  }
}
