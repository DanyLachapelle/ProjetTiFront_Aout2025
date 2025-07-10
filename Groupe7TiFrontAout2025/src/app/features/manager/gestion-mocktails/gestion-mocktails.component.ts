import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  id: number;
  name: string;
  stock: number;
  limit: number;
  unit: string;
  status: string;
}

interface MocktailForm {
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

@Component({
  selector: 'app-gestion-mocktails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-mocktails.component.html',
  styleUrl: './gestion-mocktails.component.css'
})
export class GestionMocktailsComponent implements OnInit {
  constructor(private router: Router) {}
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

  // Ingredients data
  ingredients: Ingredient[] = [
    { id: 1, name: 'Fresh mint', stock: 40, limit: 50, unit: 'g', status: 'warning' },
    { id: 2, name: 'Lime', stock: 120, limit: 100, unit: 'g', status: 'good' },
    { id: 3, name: 'Sugar syrup', stock: 800, limit: 500, unit: 'cl', status: 'good' },
    { id: 4, name: 'Pineapple juice', stock: 200, limit: 300, unit: 'cl', status: 'warning' },
    { id: 5, name: 'Coconut milk', stock: 30, limit: 50, unit: 'cl', status: 'critical' },
    { id: 6, name: 'Blood orange juice', stock: 150, limit: 200, unit: 'cl', status: 'good' },
    { id: 7, name: 'Grenadine', stock: 80, limit: 100, unit: 'cl', status: 'warning' },
    { id: 8, name: 'Sparkling water', stock: 1000, limit: 800, unit: 'cl', status: 'good' },
    { id: 9, name: 'Red berries', stock: 60, limit: 80, unit: 'g', status: 'warning' },
    { id: 10, name: 'Lemon juice', stock: 200, limit: 250, unit: 'cl', status: 'good' },
    { id: 11, name: 'Sparkling water', stock: 800, limit: 600, unit: 'cl', status: 'good' },
    { id: 12, name: 'Mango juice', stock: 120, limit: 150, unit: 'cl', status: 'warning' },
    { id: 13, name: 'Passion fruit juice', stock: 80, limit: 100, unit: 'cl', status: 'warning' },
    { id: 14, name: 'Cucumber', stock: 200, limit: 150, unit: 'g', status: 'good' },
    { id: 15, name: 'Green apple', stock: 300, limit: 250, unit: 'g', status: 'good' },
    { id: 16, name: 'Raspberries', stock: 100, limit: 120, unit: 'g', status: 'warning' },
    { id: 17, name: 'Agave syrup', stock: 150, limit: 200, unit: 'cl', status: 'warning' }
  ];

  // Filters and search
  filteredMocktails: Mocktail[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  priceSort: string = 'none';
  
  // Autocompletion
  showSuggestions: boolean = false;
  filteredSuggestions: string[] = [];
  allIngredients: string[] = [];

  // Modal management
  showMocktailModal = false;
  showDeleteModal = false;
  editingMocktail: Mocktail | null = null;
  mocktailToDelete: Mocktail | null = null;
  expandedMocktailId: number | null = null;
  isSaving = false;
  showErrors = false;

  // Form
  mocktailForm: MocktailForm = {
    name: '',
    description: '',
    price: 0,
    image: '',
    available: true,
    ingredients: [{ name: '', quantity: 0, unit: 'cl' }]
  };

  ngOnInit() {
    this.initializeIngredients();
    this.filterMocktails();
    this.loadMocktailsFromStorage();
  }

  // --- Navigation ---
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // --- Ingredients initialization ---
  initializeIngredients() {
    // Get all unique ingredients from mocktails
    const ingredientSet = new Set<string>();
    this.mocktails.forEach(mocktail => {
      mocktail.ingredients.forEach(ingredient => {
        ingredientSet.add(ingredient.name);
      });
    });
    this.allIngredients = Array.from(ingredientSet).sort();
  }

  // --- Statistics ---
  getTotalMocktails(): number {
    return this.mocktails.length;
  }

  getAvailableMocktails(): number {
    return this.mocktails.filter(m => m.available).length;
  }

  getUnavailableMocktails(): number {
    return this.mocktails.filter(m => !m.available).length;
  }

  // --- Filtering and search ---
  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Search by ingredient
      const matchesSearch = !this.searchTerm || 
        mocktail.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'available' && mocktail.available) ||
        (this.statusFilter === 'unavailable' && !mocktail.available);
      
      return matchesSearch && matchesStatus;
    });

    // Sort by price
    if (this.priceSort !== 'none') {
      this.filteredMocktails.sort((a, b) => {
        if (this.priceSort === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }
  }

  // --- Autocompletion ---
  onSearchInput() {
    this.filterSuggestions();
    this.filterMocktails();
  }

  onSearchBlur() {
    // Delay to allow clicking on a suggestion
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  filterSuggestions() {
    if (!this.searchTerm.trim()) {
      this.filteredSuggestions = this.allIngredients.slice(0, 10); // Show first 10
    } else {
      this.filteredSuggestions = this.allIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 suggestions
    }
  }

  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.filterMocktails();
  }

  // --- Mocktails management ---
  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
  }

  toggleAvailability(mocktail: Mocktail) {
    mocktail.available = !mocktail.available;
    this.saveMocktailsToStorage();
    this.filterMocktails();
  }

  deleteMocktail(mocktail: Mocktail) {
    this.mocktailToDelete = mocktail;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.mocktailToDelete) {
      this.mocktails = this.mocktails.filter(m => m.id !== this.mocktailToDelete!.id);
      this.saveMocktailsToStorage();
      this.filterMocktails();
      this.closeDeleteModal();
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.mocktailToDelete = null;
  }

  // --- Modal management ---
  openMocktailModal(mocktail?: Mocktail) {
    this.editingMocktail = mocktail || null;
    this.showErrors = false;
    
    if (mocktail) {
      // Edit mode - pre-fill the form
      this.mocktailForm = {
        name: mocktail.name,
        description: mocktail.description,
        price: mocktail.price,
        image: mocktail.image,
        available: mocktail.available,
        ingredients: [...mocktail.ingredients]
      };
    } else {
      // Create mode - empty form
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
    this.showErrors = false;
  }

  // --- Ingredients management in form ---
  addIngredient() {
    this.mocktailForm.ingredients.push({ name: '', quantity: 0, unit: 'cl' });
  }

  removeIngredient(index: number) {
    if (this.mocktailForm.ingredients.length > 1) {
      this.mocktailForm.ingredients.splice(index, 1);
    }
  }

  onIngredientNameChange(i: number) {
    const selectedName = this.mocktailForm.ingredients[i].name;
    const found = this.ingredients.find(ing => ing.name === selectedName);
    if (found) {
      this.mocktailForm.ingredients[i].unit = found.unit;
    }
  }

  // --- Validation ---
  hasValidIngredients(): boolean {
    return this.mocktailForm.ingredients.some(ing => 
      ing.name && ing.quantity > 0
    );
  }

  validateForm(): boolean {
    return !!(
      this.mocktailForm.name &&
      this.mocktailForm.description &&
      this.mocktailForm.price > 0 &&
      this.mocktailForm.image &&
      this.hasValidIngredients()
    );
  }

  // --- Save ---
  saveMocktail() {
    this.showErrors = true;
    
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    // Save simulation
    setTimeout(() => {
      if (this.editingMocktail) {
        // Edit mode - update existing mocktail
        Object.assign(this.editingMocktail, this.mocktailForm);
      } else {
        // Create mode - add new mocktail
        const newMocktail: Mocktail = {
          id: Math.max(...this.mocktails.map(m => m.id)) + 1,
          ...this.mocktailForm
        };
        this.mocktails.push(newMocktail);
      }
      
      this.saveMocktailsToStorage();
      this.filterMocktails();
      this.closeMocktailModal();
      this.isSaving = false;
    }, 500);
  }

  // --- Persistence ---
  private saveMocktailsToStorage() {
    try {
      localStorage.setItem('helha-fresh-mocktails', JSON.stringify(this.mocktails));
    } catch (error) {
      console.warn('Unable to save mocktails:', error);
    }
  }

  private loadMocktailsFromStorage() {
    try {
      const savedMocktails = localStorage.getItem('helha-fresh-mocktails');
      if (savedMocktails) {
        this.mocktails = JSON.parse(savedMocktails);
        this.filterMocktails();
      }
    } catch (error) {
      console.warn('Unable to load mocktails:', error);
    }
  }
}
