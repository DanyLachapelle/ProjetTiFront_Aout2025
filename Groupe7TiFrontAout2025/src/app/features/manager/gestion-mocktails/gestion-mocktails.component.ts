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
  // Données des mocktails
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

  // Données des ingrédients
  ingredients: Ingredient[] = [
    { id: 1, name: 'Menthe fraîche', stock: 40, limit: 50, unit: 'g', status: 'warning' },
    { id: 2, name: 'Citron vert', stock: 120, limit: 100, unit: 'g', status: 'good' },
    { id: 3, name: 'Sirop de sucre', stock: 800, limit: 500, unit: 'cl', status: 'good' },
    { id: 4, name: 'Jus d\'ananas', stock: 200, limit: 300, unit: 'cl', status: 'warning' },
    { id: 5, name: 'Lait de coco', stock: 30, limit: 50, unit: 'cl', status: 'critical' },
    { id: 6, name: 'Jus d\'orange sanguine', stock: 150, limit: 200, unit: 'cl', status: 'good' },
    { id: 7, name: 'Grenadine', stock: 80, limit: 100, unit: 'cl', status: 'warning' },
    { id: 8, name: 'Eau gazeuse', stock: 1000, limit: 800, unit: 'cl', status: 'good' },
    { id: 9, name: 'Fruits rouges', stock: 60, limit: 80, unit: 'g', status: 'warning' },
    { id: 10, name: 'Jus de citron', stock: 200, limit: 250, unit: 'cl', status: 'good' },
    { id: 11, name: 'Eau pétillante', stock: 800, limit: 600, unit: 'cl', status: 'good' },
    { id: 12, name: 'Jus de mangue', stock: 120, limit: 150, unit: 'cl', status: 'warning' },
    { id: 13, name: 'Jus de fruit de la passion', stock: 80, limit: 100, unit: 'cl', status: 'warning' },
    { id: 14, name: 'Concombre', stock: 200, limit: 150, unit: 'g', status: 'good' },
    { id: 15, name: 'Pomme verte', stock: 300, limit: 250, unit: 'g', status: 'good' },
    { id: 16, name: 'Framboises', stock: 100, limit: 120, unit: 'g', status: 'warning' },
    { id: 17, name: 'Sirop d\'agave', stock: 150, limit: 200, unit: 'cl', status: 'warning' }
  ];

  // Filtres et recherche
  filteredMocktails: Mocktail[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  priceSort: string = 'none';
  
  // Autocomplétion
  showSuggestions: boolean = false;
  filteredSuggestions: string[] = [];
  allIngredients: string[] = [];

  // Gestion des modals
  showMocktailModal = false;
  showDeleteModal = false;
  editingMocktail: Mocktail | null = null;
  mocktailToDelete: Mocktail | null = null;
  expandedMocktailId: number | null = null;
  isSaving = false;
  showErrors = false;

  // Formulaire
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

  // --- Initialisation des ingrédients ---
  initializeIngredients() {
    // Récupérer tous les ingrédients uniques depuis les mocktails
    const ingredientSet = new Set<string>();
    this.mocktails.forEach(mocktail => {
      mocktail.ingredients.forEach(ingredient => {
        ingredientSet.add(ingredient.name);
      });
    });
    this.allIngredients = Array.from(ingredientSet).sort();
  }

  // --- Statistiques ---
  getTotalMocktails(): number {
    return this.mocktails.length;
  }

  getAvailableMocktails(): number {
    return this.mocktails.filter(m => m.available).length;
  }

  getUnavailableMocktails(): number {
    return this.mocktails.filter(m => !m.available).length;
  }

  // --- Filtrage et recherche ---
  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Recherche par ingrédient
      const matchesSearch = !this.searchTerm || 
        mocktail.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'available' && mocktail.available) ||
        (this.statusFilter === 'unavailable' && !mocktail.available);
      
      return matchesSearch && matchesStatus;
    });

    // Tri par prix
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

  // --- Autocomplétion ---
  onSearchInput() {
    this.filterSuggestions();
    this.filterMocktails();
  }

  onSearchBlur() {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  filterSuggestions() {
    if (!this.searchTerm.trim()) {
      this.filteredSuggestions = this.allIngredients.slice(0, 10); // Afficher les 10 premiers
    } else {
      this.filteredSuggestions = this.allIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
        .slice(0, 8); // Limiter à 8 suggestions
    }
  }

  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.filterMocktails();
  }

  // --- Gestion des mocktails ---
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

  // --- Gestion des modals ---
  openMocktailModal(mocktail?: Mocktail) {
    this.editingMocktail = mocktail || null;
    this.showErrors = false;
    
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
    this.showErrors = false;
  }

  // --- Gestion des ingrédients dans le formulaire ---
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

  // --- Sauvegarde ---
  saveMocktail() {
    this.showErrors = true;
    
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    // Simulation d'une sauvegarde
    setTimeout(() => {
      if (this.editingMocktail) {
        // Mode édition - mettre à jour le mocktail existant
        Object.assign(this.editingMocktail, this.mocktailForm);
      } else {
        // Mode création - ajouter un nouveau mocktail
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

  // --- Persistance ---
  private saveMocktailsToStorage() {
    try {
      localStorage.setItem('helha-fresh-mocktails', JSON.stringify(this.mocktails));
    } catch (error) {
      console.warn('Impossible de sauvegarder les mocktails:', error);
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
      console.warn('Impossible de charger les mocktails:', error);
    }
  }
}
