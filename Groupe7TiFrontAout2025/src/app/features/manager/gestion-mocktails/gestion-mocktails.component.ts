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

  // Form
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

  // --- Load data from API ---
  loadMocktails() {
    this.mocktailService.getAll().subscribe({
      next: (data) => {
        this.mocktails = data;

        // Utiliser directement la disponibilité calculée par le backend
        // Pas besoin de recalculer côté frontend
                 console.log('Mocktails chargés avec disponibilité backend:', this.mocktails.map(m => ({
           name: m.name,
           available: m.available,
           forceAvailable: m.forceAvailable,
           forceAvailableType: typeof m.forceAvailable
         })));

         // Log détaillé du premier mocktail pour debug
         if (this.mocktails.length > 0) {
           const firstMocktail = this.mocktails[0];
           console.log('Détail du premier mocktail:', {
             name: firstMocktail.name,
             available: firstMocktail.available,
             forceAvailable: firstMocktail.forceAvailable,
             forceAvailableType: typeof firstMocktail.forceAvailable,
             forceAvailableStrictNull: firstMocktail.forceAvailable === null,
             forceAvailableStrictFalse: firstMocktail.forceAvailable === false,
             forceAvailableStrictTrue: firstMocktail.forceAvailable === true
           });
         }

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
      next: (data: Ingredient[]) => {
        this.ingredients = data;
        this.allIngredients = data.map((ing: Ingredient) => ing.name);
        console.log('Ingrédients chargés:', this.ingredients.length);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des ingrédients:', error);
        this.ingredients = [];
        this.allIngredients = [];
      }
    });
  }

  // --- Filtering and search ---
  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Search by ingredient
      const matchesSearch = !this.searchTerm ||
        mocktail.ingredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      // Calculer la disponibilité réelle en tenant compte de forceAvailable
      const isActuallyAvailable = this.isMocktailActuallyAvailable(mocktail);

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'available' && isActuallyAvailable) ||
        (this.statusFilter === 'unavailable' && !isActuallyAvailable);

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

    // Apply pagination
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

  // Méthode utilitaire pour déterminer si un mocktail est réellement disponible
  isMocktailActuallyAvailable(mocktail: Mocktail): boolean {
    // Si force_available est false (forcé indisponible par le gérant), toujours indisponible
    if (mocktail.forceAvailable === false) {
      return false;
    }



    // Sinon, utiliser la disponibilité basée sur le stock des ingrédients
    // (force_available = null ou true n'override pas le manque d'ingrédients)
    return mocktail.available;
  }

  // Méthode pour déterminer si un mocktail manque d'ingrédients
  isMocktailOutOfStock(mocktail: Mocktail): boolean {
    return !mocktail.available;
  }

  // Méthode pour déterminer si un mocktail est forcé indisponible par le gérant
  isMocktailForcedUnavailable(mocktail: Mocktail): boolean {
    return mocktail.forceAvailable === false;
  }

  // Méthode pour déterminer si le bouton de disponibilité doit être désactivé
  isAvailabilityButtonDisabled(mocktail: Mocktail): boolean {
    // Le bouton est désactivé seulement si le mocktail manque d'ingrédients
    // ET n'est pas forcé indisponible par le manager
    // (le manager peut toujours réactiver un mocktail qu'il a forcé indisponible)
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

    // Empêcher le clic si le mocktail manque d'ingrédients
    if (this.isAvailabilityButtonDisabled(mocktail)) {
      return;
    }

    let newForceAvailable: boolean | null;

    // Logique: basculer entre disponible normal (null) et forcé indisponible (false)
    if (mocktail.forceAvailable === false) {
      // Actuellement forcé indisponible -> revenir à l'état normal
      newForceAvailable = true;
    } else {
      // Actuellement normal (null) -> forcer comme indisponible
      newForceAvailable = false;
    }

    // Créer une requête de mise à jour avec la nouvelle valeur
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

         // Mettre à jour le mocktail
     this.mocktailService.update(mocktail.id, updateRequest).subscribe({
       next: (response) => {
         if (response.success) {
           // Recharger les données pour mettre à jour l'affichage
           this.loadMocktails();
         } else {
           console.error('Erreur lors de la mise à jour de la disponibilité:', response.message);
         }
       },
       error: (error) => {
         console.error('Erreur lors de la mise à jour de la disponibilité:', error);
       }
     });
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
      // Debug: afficher les données brutes du mocktail
      console.log('=== DONNÉES BRUTES DU MOCKTAIL ===');
      console.log('Mocktail complet:', mocktail);
      console.log('Ingrédients bruts:', mocktail.ingredients);

      // Edit mode - pre-fill the form with correct ingredient data
      this.mocktailForm = {
        name: mocktail.name,
        description: mocktail.description,
        price: mocktail.price,
        image: mocktail.image,
        available: mocktail.available,
        forceAvailable: mocktail.forceAvailable ?? false,
        ingredients: mocktail.ingredients.map(ing => {
          console.log('Mapping ingrédient:', ing);
          console.log('Type de quantity:', typeof ing.quantity, 'Valeur:', ing.quantity);

          // S'assurer que la quantité est un nombre
          let quantity = ing.quantity;
          if (typeof quantity === 'string') {
            quantity = parseFloat(quantity) || 0;
          } else if (typeof quantity !== 'number') {
            quantity = 0;
          }

          // Créer un nouvel objet pour forcer la mise à jour
          const ingredient = {
            name: ing.name,
            quantity: quantity,
            unit: ing.unit || 'cl'
          };

          console.log('Ingrédient créé:', ingredient);
          return ingredient;
        })
      };

      console.log('=== FORMULAIRE REMPLI ===');
      console.log('Formulaire complet:', this.mocktailForm);
      console.log('Ingrédients du formulaire:', this.mocktailForm.ingredients);

      // Forcer la détection des changements pour s'assurer que l'UI se met à jour
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
    // S'assurer que la quantité est un nombre valide
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
    // Convertir la valeur en nombre si possible
    const numericValue = parseFloat(this.newIngredientForm.stock as any);
    if (!isNaN(numericValue)) {
      this.newIngredientForm.stock = numericValue;
    }
  }

  onNewIngredientLimitChange(): void {
    // Convertir la valeur en nombre si possible
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
        // Ajouter l'ingrédient créé dans la liste locale
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

        // Ajouter automatiquement l'ingrédient créé au mocktail en cours d'édition
        if (this.showMocktailModal) {
          this.mocktailForm.ingredients.push({
            name: ingredient.name,
            quantity: 0,
            unit: ingredient.unit
          });
        }

        // Recharger la liste des ingrédients pour s'assurer de la cohérence
        this.loadIngredients();
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'ingrédient', err);
        // Optionnel : afficher un message d'erreur à l'utilisateur
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
        forceAvailable: this.mocktailForm.forceAvailable,
        ingredients: this.mocktailForm.ingredients.map(ing => ({
          name: ing.name,
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit || 'cl'
        }))
      };

      this.mocktailService.update(this.editingMocktail.id, updateRequest).subscribe({
        next: (response) => {
          console.log('Mocktail mis à jour avec succès:', response);
          if (response.success) {
            this.loadMocktails();
            this.closeMocktailModal();
          } else {
            console.error('Erreur lors de la mise à jour:', response.message);
          }
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
      console.log('Prix avant create (type et valeur):', typeof this.mocktailForm.price, this.mocktailForm.price);
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
