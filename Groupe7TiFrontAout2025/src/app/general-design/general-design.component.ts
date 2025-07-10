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
  currentPage: 'login' | 'helha-fresh' | 'client-menu' | 'mocktails-management' | 'ingredients-management' | 'ca-visualization' | 'sales-history' = 'login';
  
  // Données pour les mocktails.
  mocktails = [
    {
      id: 1,
      name: 'Mojito sans alcool',
      description: 'Rafraîchissant avec menthe fraîche et citron vert',
      price: 8.50,
      available: true,
      image: '🍹',
      ingredients: [
        { name: 'Menthe fraîche', quantity: 5, unit: 'g' },
        { name: 'Citron vert', quantity: 20, unit: 'g' }, // 2 pcs => 20g
        { name: 'Sirop de sucre', quantity: 1.5, unit: 'cl' }, // 15ml => 1.5cl
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
        { name: 'Sirop de sucre', quantity: 1, unit: 'cl' } // 10ml => 1cl
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
        { name: 'Concombre', quantity: 10, unit: 'g' }, // 1 pcs => 10g
        { name: 'Pomme verte', quantity: 10, unit: 'g' }, // 1 pcs => 10g
        { name: 'Menthe fraîche', quantity: 3, unit: 'g' }
      ]
    },
    {
      id: 7,
      name: 'Pink Lemonade',
      description: 'Citron, framboise et sirop d’agave',
      price: 7.80,
      available: true,
      image: '🍋',
      ingredients: [
        { name: 'Jus de citron', quantity: 8, unit: 'cl' },
        { name: 'Framboises', quantity: 6, unit: 'g' },
        { name: 'Sirop d\'agave', quantity: 1.2, unit: 'cl' } // 12ml => 1.2cl
      ]
    }
  ];

  // --- Gestion des mocktails (édition/création) ---
  showMocktailModal = false;
  editingMocktail: any = null;
  expandedMocktailId: number | null = null;
  mocktailForm = {
    name: '',
    description: '',
    price: 0,
    image: '',
    available: true,
    ingredients: [{ name: '', quantity: 0, unit: 'cl' }]
  };

  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
  }

  openMocktailModal(mocktail?: any) {
    this.editingMocktail = mocktail || null;
    if (mocktail) {
      // Mode édition - pré-remplir le formulaire
      this.mocktailForm = {
        name: mocktail.name,
        description: mocktail.description,
        price: mocktail.price,
        image: mocktail.image,
        available: mocktail.available,
        ingredients: [...mocktail.ingredients]
      };
    } else {
      // Mode création - formulaire vide
      this.mocktailForm = {
        name: '',
        description: '',
        price: 0,
        image: '',
        available: true,
        ingredients: [{ name: '', quantity: 0, unit: 'cl' }]
      };
    }
    this.showMocktailModal = true;
  }

  closeMocktailModal() {
    this.showMocktailModal = false;
    this.editingMocktail = null;
  }

  addIngredient() {
    this.mocktailForm.ingredients.push({ name: '', quantity: 0, unit: 'cl' });
  }

  removeIngredient(index: number) {
    if (this.mocktailForm.ingredients.length > 1) {
      this.mocktailForm.ingredients.splice(index, 1);
    }
  }

  saveMocktail() {
    if (this.editingMocktail) {
      // Mode édition - mettre à jour le mocktail existant
      Object.assign(this.editingMocktail, this.mocktailForm);
    } else {
      // Mode création - ajouter un nouveau mocktail
      const newMocktail = {
        id: Math.max(...this.mocktails.map(m => m.id)) + 1,
        ...this.mocktailForm
      };
      this.mocktails.push(newMocktail);
    }
    this.closeMocktailModal();
  }

  onIngredientNameChange(i: number) {
    const selectedName = this.mocktailForm.ingredients[i].name;
    const found = this.ingredients.find(ing => ing.name === selectedName);
    if (found) {
      this.mocktailForm.ingredients[i].unit = found.unit;
    }
  }

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

  // Historique des ventes (exemple)
  salesHistory = [
    {
      date: '2025-01-10T15:42:00',
      total: 24.50,
      mocktails: [
        { name: 'Mojito sans alcool', quantity: 2 },
        { name: 'Berry Fizz', quantity: 1 }
      ]
    },
    {
      date: '2025-02-05T14:10:00',
      total: 16.00,
      mocktails: [
        { name: 'Virgin Colada', quantity: 1 },
        { name: 'Pink Lemonade', quantity: 1 }
      ]
    },
    {
      date: '2025-03-18T19:05:00',
      total: 8.50,
      mocktails: [
        { name: 'Mojito sans alcool', quantity: 1 }
      ]
    },
    {
      date: '2025-04-22T12:30:00',
      total: 18.00,
      mocktails: [
        { name: 'Sunset Spritz', quantity: 2 }
      ]
    },
    {
      date: '2025-05-15T17:55:00',
      total: 27.70,
      mocktails: [
        { name: 'Tropical Dream', quantity: 2 },
        { name: 'Green Detox', quantity: 1 }
      ]
    },
    {
      date: '2025-06-03T20:10:00',
      total: 32.00,
      mocktails: [
        { name: 'Berry Fizz', quantity: 2 },
        { name: 'Sunset Spritz', quantity: 2 }
      ]
    },
    {
      date: '2025-06-25T13:20:00',
      total: 12.50,
      mocktails: [
        { name: 'Virgin Colada', quantity: 1 }
      ]
    }
  ];

  // Filtres pour le CA
  selectedFilter: 'today' | 'week' | 'month' | 'year' | 'custom' = 'today';
  // Plage personnalisée
  customDateRange = { start: '', end: '' };

  // NOUVELLES MÉTHODES CA BASÉES SUR salesHistory

  // Retourne la liste des ventes filtrée selon le filtre sélectionné
  getFilteredSales() {
    const now = new Date();
    let start: Date, end: Date;
    switch (this.selectedFilter) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week': {
        // Commence lundi (ISO)
        const day = (now.getDay() + 6) % 7; // 0=dimanche, 1=lundi...
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0,0,0,0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'custom':
        if (!this.customDateRange.start || !this.customDateRange.end) return [];
        start = new Date(this.customDateRange.start);
        start.setHours(0,0,0,0);
        end = new Date(this.customDateRange.end);
        end.setHours(23,59,59,999);
        break;
      default:
        return [];
    }
    return this.salesHistory.filter(sale => {
      const d = new Date(sale.date);
      return d >= start && d <= end;
    });
  }

  // Calcule le CA total sur la période filtrée
  getCurrentCA(): number {
    return this.getFilteredSales().reduce((sum, sale) => sum + sale.total, 0);
  }

  // Calcule l'évolution du CA (par jour) sur la période filtrée
  getCAEvolutionData(): {date: string, amount: number}[] {
    const filtered = this.getFilteredSales();
    if (!filtered.length) return [];
    // Regroupement par jour
    const map = new Map<string, number>();
    filtered.forEach(sale => {
      const d = sale.date.slice(0,10); // 'YYYY-MM-DD'
      map.set(d, (map.get(d) || 0) + sale.total);
    });
    // Génère la liste triée par date croissante
    return Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([date, amount]) => ({date, amount}));
  }

  // Ajout pour l'affichage interactif des détails de vente
  openedSaleIndex: number | null = null;

  // Ouvre/ferme le détail d'une vente
  toggleSaleDetail(index: number): void {
    this.openedSaleIndex = this.openedSaleIndex === index ? null : index;
  }

  // Utilitaire pour récupérer le prix unitaire d'un mocktail vendu
  getMocktailUnitPrice(sale: any, m: any): number {
    if (m.price !== undefined) return m.price;
    // Si pas de prix, on tente de le calculer (total divisé par la somme des quantités)
    const totalQty = sale.mocktails.reduce((sum: number, mk: any) => sum + (mk.quantity || 1), 0);
    return totalQty ? sale.total / totalQty : 0;
  }

  // Pour l'échelle du graphique CA
  getMaxCAForChart(): number {
    const data = this.getCAEvolutionData();
    if (!data.length) return 100;
    // On arrondit au 10 supérieur pour un rendu plus joli
    return Math.ceil(Math.max(...data.map(e => e.amount)) / 10) * 10;
  }
  // Pour la page historique des ventes
  getSortedSalesHistory() {
    return this.salesHistory.slice().sort((a, b) => b.date.localeCompare(a.date));
  }

  // Navigation
  nextPage() {
    const pages = ['login', 'helha-fresh', 'client-menu', 'mocktails-management', 'ingredients-management', 'ca-visualization', 'sales-history'];
    const currentIndex = pages.indexOf(this.currentPage);
    const nextIndex = (currentIndex + 1) % pages.length;
    this.currentPage = pages[nextIndex] as any;
  }

  prevPage() {
    const pages = ['login', 'helha-fresh', 'client-menu', 'mocktails-management', 'ingredients-management', 'ca-visualization', 'sales-history'];
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

  // --- Gestion modals réapprovisionnement et ajout ingrédient ---
  showRestockModal = false;
  restockIngredient: any = null;
  restockQuantity: number = 1;

  openRestockModal(ingredient: any) {
    this.restockIngredient = ingredient;
    this.restockQuantity = 1;
    this.showRestockModal = true;
  }
  closeRestockModal() {
    this.showRestockModal = false;
    this.restockIngredient = null;
    this.restockQuantity = 1;
  }
  validateRestock() {
    if (this.restockIngredient && this.restockQuantity > 0) {
      this.restockIngredient.stock += Number(this.restockQuantity);
    }
    this.closeRestockModal();
  }

  showAddIngredientModal = false;
  newIngredientForm = {
    name: '',
    type: 'liquide',
    stock: 0,
    limit: 1
  };
  openAddIngredientModal() {
    this.newIngredientForm = { name: '', type: 'liquide', stock: 0, limit: 1 };
    this.showAddIngredientModal = true;
  }
  closeAddIngredientModal() {
    this.showAddIngredientModal = false;
  }
  validateAddIngredient() {
    if (!this.newIngredientForm.name || this.newIngredientForm.limit <= 0) return;
    this.ingredients.push({
      id: Math.max(0, ...this.ingredients.map(i => i.id)) + 1,
      name: this.newIngredientForm.name,
      stock: Number(this.newIngredientForm.stock),
      limit: Number(this.newIngredientForm.limit),
      unit: this.newIngredientForm.type === 'liquide' ? 'cl' : 'g',
      status: this.getStockStatus(Number(this.newIngredientForm.stock), Number(this.newIngredientForm.limit))
    });
    this.closeAddIngredientModal();
  }

  showEditLimitModal = false;
  editLimitIngredient: any = null;
  editLimitValue: number = 1;

  openEditLimitModal(ingredient: any) {
    this.editLimitIngredient = ingredient;
    this.editLimitValue = ingredient.limit;
    this.showEditLimitModal = true;
  }
  closeEditLimitModal() {
    this.showEditLimitModal = false;
    this.editLimitIngredient = null;
    this.editLimitValue = 1;
  }
  validateEditLimit() {
    if (this.editLimitIngredient && this.editLimitValue > 0) {
      this.editLimitIngredient.limit = Number(this.editLimitValue);
      // Met à jour le statut si besoin
      this.editLimitIngredient.status = this.getStockStatus(this.editLimitIngredient.stock, this.editLimitIngredient.limit);
    }
    this.closeEditLimitModal();
  }
}
