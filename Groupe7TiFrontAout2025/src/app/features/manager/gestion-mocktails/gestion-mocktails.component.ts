import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MocktailService, Mocktail, CreateMocktailRequest, UpdateMocktailRequest, Ingredient } from '../../../services/mocktail.service';

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
  constructor(
    private router: Router,
    private mocktailService: MocktailService
  ) {}

  // Mocktails data
  mocktails: Mocktail[] = [];

  // Ingredients data - maintenant chargés depuis l'API
  ingredients: Ingredient[] = [];

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
    this.loadMocktails();
    this.loadIngredients();
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

  // --- Navigation ---
  goBack() {
    this.router.navigate(['/dashboard']);
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
    // Note: Le champ available est calculé côté backend, 
    // cette fonctionnalité nécessiterait un endpoint spécifique
    // pour l'instant, on recharge les données
    this.loadMocktails();
  }

  deleteMocktail(mocktail: Mocktail) {
    this.mocktailToDelete = mocktail;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.mocktailToDelete) {
      this.mocktailService.delete(this.mocktailToDelete.id).subscribe({
        next: () => {
          this.loadMocktails();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
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
    const isValid = !!(
      this.mocktailForm.name &&
      this.mocktailForm.description &&
      this.mocktailForm.price > 0 &&
      this.mocktailForm.image &&
      this.hasValidIngredients()
    );
    
    console.log('Validation du formulaire:', {
      name: this.mocktailForm.name,
      description: this.mocktailForm.description,
      price: this.mocktailForm.price,
      image: this.mocktailForm.image,
      hasValidIngredients: this.hasValidIngredients(),
      isValid: isValid
    });
    
    return isValid;
  }

  // --- Save ---
  saveMocktail() {
    this.showErrors = true;
    
    if (!this.validateForm()) {
      console.log('Formulaire invalide');
      return;
    }

    this.isSaving = true;
    console.log('Début de la sauvegarde...');

    if (this.editingMocktail) {
      // Edit mode - update existing mocktail
      console.log('Mode édition pour:', this.editingMocktail.name);
      const updateRequest: UpdateMocktailRequest = {
        name: this.mocktailForm.name,
        description: this.mocktailForm.description,
        price: this.mocktailForm.price,
        image: this.mocktailForm.image,
        ingredients: this.mocktailForm.ingredients
      };

      this.mocktailService.update(this.editingMocktail.id, updateRequest).subscribe({
        next: (response) => {
          console.log('Mocktail mis à jour avec succès:', response);
          this.loadMocktails();
          this.closeMocktailModal();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.isSaving = false;
        }
      });
    } else {
      // Create mode - add new mocktail
      console.log('Mode création pour:', this.mocktailForm.name);
      const createRequest: CreateMocktailRequest = {
        name: this.mocktailForm.name,
        description: this.mocktailForm.description,
        price: this.mocktailForm.price,
        image: this.mocktailForm.image,
        ingredients: this.mocktailForm.ingredients
      };

      console.log('Données envoyées:', createRequest);

      this.mocktailService.create(createRequest).subscribe({
        next: (response) => {
          console.log('Mocktail créé avec succès:', response);
          this.loadMocktails();
          this.closeMocktailModal();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.isSaving = false;
        }
      });
    }
  }

}
