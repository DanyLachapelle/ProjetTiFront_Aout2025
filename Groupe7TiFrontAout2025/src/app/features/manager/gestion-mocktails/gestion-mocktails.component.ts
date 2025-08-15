import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MocktailService, Mocktail, CreateMocktailRequest, UpdateMocktailRequest } from '../../../services/mocktail.service';
import { IngredientService, Ingredient } from '../../../services/ingredient.service';

interface MocktailForm {
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  forceAvailable: boolean | null;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

interface NewIngredientForm {
  name: string;
  type: string;
  stock: number;
  limit: number;
  allergen: string;
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
    private mocktailService: MocktailService,
    private ingredientService: IngredientService,
    private cdr: ChangeDetectorRef
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
  showAddIngredientModal = false;
  editingMocktail: Mocktail | null = null;
  mocktailToDelete: Mocktail | null = null;
  expandedMocktailId: number | null = null;
  isSaving = false;
  showErrors = false;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedMocktails: Mocktail[] = [];

  //  Mocktail form data
  mocktailForm: MocktailForm = {
    name: '',
    description: '',
    price: 0,
    image: '',
    available: true,
    forceAvailable: false,
    ingredients: [{ name: '', quantity: 0, unit: 'cl' }]
  };

  // New ingredient form
  newIngredientForm: NewIngredientForm = {
    name: '',
    type: 'liquide',
    stock: 0,
    limit: 1,
    allergen: 'none'
  };

  ngOnInit() {
    this.loadIngredients();
    this.loadMocktails();
  }

  // ---  Load all mocktails from the API  ---
  loadMocktails() {
    this.mocktailService.getAll().subscribe({
      next: (data) => {
        this.mocktails = data;
        // Use backend-calculated availability directly
        this.filterMocktails();
      },
      error: (error) => {
        console.error('Error loading mocktails:', error);
        this.mocktails = [];
      }
    });
  }
  // --- Load all ingredients from the API ---

  loadIngredients() {
    this.mocktailService.getAllIngredients().subscribe({
      next: (data: Ingredient[]) => {
        this.ingredients = data;
        this.allIngredients = data.map((ing: Ingredient) => ing.name);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des ingrédients:', error);
        this.ingredients = [];
        this.allIngredients = [];
      }
    });
  }

  // --- Filter mocktails based on search term, status filter, and price sort ---
  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Search by ingredient
      const matchesSearch = !this.searchTerm ||
        mocktail.ingredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      // Calculate real availability taking forceAvailable into account
      const isActuallyAvailable = this.isMocktailActuallyAvailable(mocktail);

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'available' && isActuallyAvailable) ||
        (this.statusFilter === 'unavailable' && !isActuallyAvailable);

      return matchesSearch && matchesStatus;
    });

    // Apply price sorting
    if (this.priceSort !== 'none') {
      this.filteredMocktails.sort((a, b) => {
        if (this.priceSort === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    // Apply pagination after filtering and sorting
    this.applyPagination();
  }

  // --- Pagination methods ---
  private applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMocktails = this.filteredMocktails.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredMocktails.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.getTotalPages());
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  canGoToPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  canGoToNextPage(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  getPaginationInfo(): string {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredMocktails.length);
    return `Showing ${startIndex}-${endIndex} of ${this.filteredMocktails.length} mocktails`;
  }

  // --- Search and filter methods ---
  onSearchInput() {
    this.currentPage = 1; // Reset to first page when searching
    this.filterMocktails();
    this.updateSuggestions();
  }

  onSearchBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  updateSuggestions() {
    if (!this.searchTerm) {
      this.filteredSuggestions = [];
      return;
    }

    this.filteredSuggestions = this.allIngredients.filter(ingredient =>
      ingredient.toLowerCase().includes(this.searchTerm.toLowerCase())
    ).slice(0, 5);
  }

  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.filterMocktails();
  }

  // --- Statistics ---
  getTotalMocktails(): number {
    return this.mocktails.length;
  }

  // Utility method to determine if a mocktail is actually available
  isMocktailActuallyAvailable(mocktail: Mocktail): boolean {
    // If forceAvailable is false (manually set unavailable by the manager), always unavailable
    if (mocktail.forceAvailable === false) {
      return false;
    }
    // Otherwise, check the available property
    return mocktail.available;
  }

  // Method to determine if a mocktail is out of stock
  isMocktailOutOfStock(mocktail: Mocktail): boolean {
    return !mocktail.available;
  }

  // Method to determine if a mocktail is forcibly unavailable by the manager
  isMocktailForcedUnavailable(mocktail: Mocktail): boolean {
    return mocktail.forceAvailable === false;
  }

  // Method to determine if the availability button should be disabled
  isAvailabilityButtonDisabled(mocktail: Mocktail): boolean {
    // The button is disabled only if the mocktail is out of ingredients
    // AND is not forcibly unavailable by the manager
    // (the manager can always reactivate a mocktail they have forcibly made unavailable)
    return !mocktail.available && mocktail.forceAvailable !== false;
  }

  getAvailableMocktails(): number {
    return this.mocktails.filter(m => this.isMocktailActuallyAvailable(m)).length;
  }

  getUnavailableMocktails(): number {
    return this.mocktails.filter(m => !this.isMocktailActuallyAvailable(m)).length;
  }

  // --- Navigation ---
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // --- Mocktails management ---
  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
  }

  toggleAvailability(mocktail: Mocktail) {

    // Prevent click if the mocktail is out of ingredients
    if (this.isAvailabilityButtonDisabled(mocktail)) {
      return;
    }

    let newForceAvailable: boolean | null;

    // Logic: toggle between normal availability (null) and forced unavailable (false)
    if (mocktail.forceAvailable === false) {
      // Currently forced unavailable -> revert to normal state
      newForceAvailable = true;
    } else {
      // Currently normal (null) -> force as unavailable
      newForceAvailable = false;
    }

    // Create an update request with the new value
    const updateRequest: UpdateMocktailRequest = {
      name: mocktail.name,
      description: mocktail.description,
      price: mocktail.price,
      image: mocktail.image,
      forceAvailable: newForceAvailable,
      ingredients: mocktail.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit || 'cl'
      }))
    };

    // Update the mocktail
    this.mocktailService.update(mocktail.id, updateRequest).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload data to update the display
          this.loadMocktails();
        } else {
          console.error('Error updating availability:', response.message);
        }
      },
      error: (error) => {
        console.error('Error updating availability:', error);
      }
    });
  }

  // --- Delete mocktail ---
  deleteMocktail(mocktail: Mocktail) {
    this.mocktailToDelete = mocktail;
    this.showDeleteModal = true;
  }

  // Confirm deletion of the mocktail
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

  // Close the delete confirmation modal
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.mocktailToDelete = null;
  }

  // --- Modal management ---
  openMocktailModal(mocktail?: Mocktail) {
    this.editingMocktail = mocktail || null;
    this.showErrors = false;

    if (mocktail) {


      // Edit mode - pre-fill the form with the correct ingredient data
      this.mocktailForm = {
        name: mocktail.name,
        description: mocktail.description,
        price: mocktail.price,
        image: mocktail.image,
        available: mocktail.available,
        forceAvailable: mocktail.forceAvailable ?? false,
        ingredients: mocktail.ingredients.map(ing => {
          // Ensure quantity is a number
          let quantity = ing.quantity;
          if (typeof quantity === 'string') {
            quantity = parseFloat(quantity) || 0;
          } else if (typeof quantity !== 'number') {
            quantity = 0;
          }

          // Create a new object to force form update
          const ingredient = {
            name: ing.name,
            quantity: quantity,
            unit: ing.unit || 'cl'
          };

          return ingredient;
        })
      };


      // Force change detection to ensure the UI updates
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    } else {
      // Create mode - empty form
      this.mocktailForm = {
        name: '',
        description: '',
        price: 0,
        image: '',
        available: true,
        forceAvailable: false,
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

  onIngredientQuantityChange(i: number) {
    // Ensure the quantity is a valid number
    const quantity = this.mocktailForm.ingredients[i].quantity;
    if (typeof quantity === 'string') {
      this.mocktailForm.ingredients[i].quantity = Number(quantity) || 0;
    }
  }

  // --- New ingredient modal methods ---
  openAddIngredientModal(): void {
    this.newIngredientForm = {
      name: '',
      type: 'liquide',
      stock: 0,
      limit: 1,
      allergen: 'none'
    };
    this.showErrors = false;
    this.showAddIngredientModal = true;
  }

  closeAddIngredientModal(): void {
    this.showAddIngredientModal = false;
  }

  onNewIngredientStockChange(): void {
    // Convert the quantity to a number if possible
    const numericValue = parseFloat(this.newIngredientForm.stock as any);
    if (!isNaN(numericValue)) {
      this.newIngredientForm.stock = numericValue;
    }
  }

  onNewIngredientLimitChange(): void {
    // Convert the value to a number if possible
    const numericValue = parseFloat(this.newIngredientForm.limit as any);
    if (!isNaN(numericValue)) {
      this.newIngredientForm.limit = numericValue;
    }
  }

  validateAddIngredient(): void {
    this.showErrors = true;
    if (!this.newIngredientForm.name ||
        this.newIngredientForm.limit <= 0 ||
        this.newIngredientForm.stock < 0 ||
        this.newIngredientForm.stock === null ||
        this.newIngredientForm.limit === null) return;

    const newIngredientPayload = {
      name: this.newIngredientForm.name,
      quantity: Number(this.newIngredientForm.stock),
      restockThreshold: Number(this.newIngredientForm.limit),
      unit: this.newIngredientForm.type === 'liquide' ? 'cl' : 'g',
      allergen: this.newIngredientForm.allergen || 'none'
    };

    this.ingredientService.CreateIngredient(newIngredientPayload).subscribe({
      next: (createdIngredient) => {
        // Add the new ingredient to the local form list
        const ingredient: Ingredient = {
          id: createdIngredient.id || Math.max(0, ...this.ingredients.map(i => i.id)) + 1,
          name: createdIngredient.name,
          quantity: createdIngredient.quantity,
          restockThreshold: createdIngredient.restock_threshold,
          unit: createdIngredient.unit,
          allergen: createdIngredient.allergen
        };

        this.ingredients.push(ingredient);
        this.closeAddIngredientModal();

        // Automatically add the created ingredient to the currently edited mocktail
        if (this.showMocktailModal) {
          this.mocktailForm.ingredients.push({
            name: ingredient.name,
            quantity: 0,
            unit: ingredient.unit
          });
        }

        // Reload the ingredient list to ensure consistency
        this.loadIngredients();
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'ingrédient', err);
      }
    });
  }

  // --- Validation ---
  hasValidIngredients(): boolean {
    return this.mocktailForm.ingredients.some(ing =>
      ing.name && ing.quantity > 0 && typeof ing.quantity === 'number'
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



    return isValid;
  }

  // --- Save ---
  saveMocktail() {
    this.showErrors = true;

    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    if (this.editingMocktail) {
      // Edit mode - update existing mocktail
      const updateRequest: UpdateMocktailRequest = {
        name: this.mocktailForm.name,
        description: this.mocktailForm.description,
        price: this.mocktailForm.price,
        image: this.mocktailForm.image,
        forceAvailable: this.mocktailForm.forceAvailable,
        ingredients: this.mocktailForm.ingredients.map(ing => ({
          name: ing.name,
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit || 'cl'
        }))
      };

      this.mocktailService.update(this.editingMocktail.id, updateRequest).subscribe({
        next: (response) => {

          if (response.success) {
            this.loadMocktails();
            this.closeMocktailModal();
          } else {
            console.error('Error while updating:', response.message);
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error during update:', error);
          this.isSaving = false;
        }
      });
    } else {
      // Create mode - add new mocktail
      const createRequest: CreateMocktailRequest = {
        name: this.mocktailForm.name,
        description: this.mocktailForm.description,
        price: this.mocktailForm.price,
        image: this.mocktailForm.image,
        ingredients: this.mocktailForm.ingredients
      };

      this.mocktailService.create(createRequest).subscribe({
        next: (response) => {
          this.loadMocktails();
          this.closeMocktailModal();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error during creation:', error);
          this.isSaving = false;
        }
      });
    }
  }
}
