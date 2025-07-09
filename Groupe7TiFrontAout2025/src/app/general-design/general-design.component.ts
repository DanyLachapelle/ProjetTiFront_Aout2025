import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-design',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-design.component.html',
  styleUrl: './general-design.component.css'
})
export class GeneralDesignComponent {
  currentPage: 'login' | 'client-menu' | 'mocktails-management' | 'ingredients-management' | 'ca-visualization' = 'login';
  
  // Données pour les mocktails
  mocktails = [
    {
      id: 1,
      name: 'Mojito sans alcool',
      description: 'Rafraîchissant avec menthe fraîche et citron vert',
      price: 8.50,
      available: true,
      image: '🍹'
    },
    {
      id: 2,
      name: 'Virgin Colada',
      description: 'Exotique avec noix de coco et ananas',
      price: 9.00,
      available: true,
      image: '🥤'
    },
    {
      id: 3,
      name: 'Sunset Spritz',
      description: 'Orange sanguine, grenadine et eau gazeuse',
      price: 7.50,
      available: false,
      image: '🌅'
    },
    {
      id: 4,
      name: 'Berry Fizz',
      description: 'Fruits rouges, citron et eau pétillante',
      price: 8.00,
      available: true,
      image: '🍓'
    },
    {
      id: 5,
      name: 'Tropical Dream',
      description: 'Mangue, passion et lait de coco',
      price: 9.20,
      available: true,
      image: '🥭'
    },
    {
      id: 6,
      name: 'Green Detox',
      description: 'Concombre, pomme verte et menthe',
      price: 8.80,
      available: true,
      image: '🥒'
    },
    {
      id: 7,
      name: 'Pink Lemonade',
      description: 'Citron, framboise et sirop d’agave',
      price: 7.80,
      available: true,
      image: '🍋'
    }
  ];

  // --- Gestion du panier et de la modal ---
  showOrderModal = false;
  selectedMocktail: any = null;
  selectedQuantity = 1;
  orderList: {mocktail: any, quantity: number}[] = [];

  openOrderModal(mocktail: any) {
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
    if (!this.selectedMocktail) return;
    // Chercher si le mocktail est déjà dans la liste
    const found = this.orderList.find(item => item.mocktail.id === this.selectedMocktail.id);
    if (found) {
      found.quantity += this.selectedQuantity;
    } else {
      this.orderList.push({mocktail: this.selectedMocktail, quantity: this.selectedQuantity});
    }
    this.closeOrderModal();
  }

  getOrderTotal() {
    return this.orderList.reduce((sum, item) => sum + item.mocktail.price * item.quantity, 0);
  }

  clearOrder() {
    this.orderList = [];
  }

  removeOrderItem(id: number) {
    this.orderList = this.orderList.filter(item => item.mocktail.id !== id);
  }

  increaseQuantity(item: {mocktail: any, quantity: number}) {
    item.quantity++;
  }
  decreaseQuantity(item: {mocktail: any, quantity: number}) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  showFullOrderModal = false;

  openFullOrderModal() {
    this.showFullOrderModal = true;
  }
  closeFullOrderModal() {
    this.showFullOrderModal = false;
  }

  // Données pour les ingrédients
  ingredients = [
    { id: 1, name: 'Menthe fraîche', stock: 40, limit: 50, unit: 'g', status: 'warning' },
    { id: 2, name: 'Citron vert', stock: 120, limit: 100, unit: 'g', status: 'good' },
    { id: 3, name: 'Sirop de sucre', stock: 800, limit: 500, unit: 'ml', status: 'good' },
    { id: 4, name: 'Jus d\'ananas', stock: 200, limit: 300, unit: 'ml', status: 'warning' },
    { id: 5, name: 'Noix de coco', stock: 30, limit: 50, unit: 'g', status: 'critical' }
  ];

  // Données pour le CA
  caData = {
    today: 245.50,
    thisWeek: 1247.80,
    thisMonth: 5234.20,
    thisYear: 15678.90
  };

  // Filtres pour le CA
  selectedFilter: 'today' | 'week' | 'month' | 'year' | 'custom' = 'today';
  customDateRange = { start: '', end: '' };

  // Navigation
  nextPage() {
    const pages = ['login', 'client-menu', 'mocktails-management', 'ingredients-management', 'ca-visualization'];
    const currentIndex = pages.indexOf(this.currentPage);
    const nextIndex = (currentIndex + 1) % pages.length;
    this.currentPage = pages[nextIndex] as any;
  }

  prevPage() {
    const pages = ['login', 'client-menu', 'mocktails-management', 'ingredients-management', 'ca-visualization'];
    const currentIndex = pages.indexOf(this.currentPage);
    const prevIndex = currentIndex === 0 ? pages.length - 1 : currentIndex - 1;
    this.currentPage = pages[prevIndex] as any;
  }

  // Gestion des stocks
  getStockStatus(stock: number, limit: number): string {
    if (stock <= limit * 0.6) return 'critical';
    if (stock <= limit * 0.8) return 'warning';
    return 'good';
  }

  // Calcul du CA selon le filtre
  getCurrentCA(): number {
    switch (this.selectedFilter) {
      case 'today': return this.caData.today;
      case 'week': return this.caData.thisWeek;
      case 'month': return this.caData.thisMonth;
      case 'year': return this.caData.thisYear;
      default: return this.caData.today;
    }
  }
}
