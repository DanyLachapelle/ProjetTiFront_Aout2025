import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {IngredientService} from '../../../services/ingredient.service';


interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  restock_threshold: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  type: 'liquide' | 'solide';
  lastRestock?: string;
}

@Component({
  selector: 'app-gestion-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-ingredients.component.html',
  styleUrl: './gestion-ingredients.component.css'
})
export class GestionIngredientsComponent implements OnInit {
  ingredients: Ingredient[] = [];

  constructor(
    private router: Router,
    private ingredientService: IngredientService // injection du service
  ) {}

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients(): void {
    this.ingredientService.GetAll().subscribe({
      next: (data) => {
        const ingredientsArray = Array.isArray(data) ? data : data.ingredients;

        this.ingredients = ingredientsArray.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          restock_threshold: item.restock_threshold,
          unit: item.unit,
          status: this.getStockStatus(item.quantity, item.restock_threshold),
          type: item.type,
          lastRestock: item.lastRestock
        }));

        this.updateStatistics();
      },
    });
  }

  // Filter and search properties
  selectedFilter: 'all' | 'good' | 'warning' | 'critical' = 'all';
  searchTerm: string = '';
  selectedType: 'all' | 'liquide' | 'solide' = 'all';

  // Modal states
  showRestockModal = false;
  showAddIngredientModal = false;
  showEditLimitModal = false;
  showDeleteModal = false;
  showDetailsModal = false;

  // Modal data
  restockIngredient: Ingredient | null = null;
  restockQuantity: number = 1;
  restockCost: number = 0;

  newIngredientForm = {
    name: '',
    type: 'liquide' as 'liquide' | 'solide',
    stock: 0,
    limit: 1
  };

  editLimitIngredient: Ingredient | null = null;
  editLimitValue: number = 1;

  selectedIngredient: Ingredient | null = null;

  // Statistics
  totalIngredients: number = 0;
  lowStockCount: number = 0;

  // Sort properties
  sortBy: 'name' | 'stock' | 'lastRestock' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 12;



  // Navigation
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Filter methods
  setFilter(filter: 'all' | 'good' | 'warning' | 'critical'): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  setTypeFilter(type: 'all' | 'liquide' | 'solide'): void {
    this.selectedType = type;
    this.currentPage = 1;
  }

  // Get filtered ingredients
  getFilteredIngredients(): Ingredient[] {
    let filtered = [...this.ingredients];

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.status === this.selectedFilter);
    }

    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.type === this.selectedType);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.quantity;
          bValue = b.quantity;
          break;

        case 'lastRestock':
          aValue = a.lastRestock || '';
          bValue = b.lastRestock || '';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  // Get all filtered ingredients (without pagination) for statistics
  getAllFilteredIngredients(): Ingredient[] {
    let filtered = [...this.ingredients];

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.status === this.selectedFilter);
    }

    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(ingredient => ingredient.type === this.selectedType);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  private getStatusPriority(status: string): number {
    switch (status) {
      case 'critical': return 3;
      case 'warning': return 2;
      case 'good': return 1;
      default: return 0;
    }
  }

  // Sort methods
  setSort(field: 'name' | 'stock' | 'lastRestock'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return '↕️';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  // Stock management
  getStockStatus(stock: number, limit: number): 'good' | 'warning' | 'critical' {
    if (stock < limit * 0.8) return 'critical';
    if (stock > limit * 1.5) return 'good';
    return 'warning';
  }

  getStockPercentage(stock: number, limit: number): number {
    // La jauge fait 100% pour 4x la limite, le trait noir est à 25% (1x la limite)
    return Math.min((stock / (4 * limit)) * 100, 100);
  }

  getStockColor(stock: number, limit: number): string {
    const status = this.getStockStatus(stock, limit);
    switch (status) {
      case 'critical': return '#ff4757'; // Rouge pour critical
      case 'warning': return '#ffa502'; // Orange/Jaune pour warning
      case 'good': return '#2ed573'; // Vert pour good
      default: return '#2ed573';
    }
  }

  // Statistics
  updateStatistics(): void {
    this.totalIngredients = this.ingredients.length;
    this.lowStockCount = this.ingredients.filter(ingredient =>
      ingredient.status === 'warning' || ingredient.status === 'critical').length;
  }

  getStatusCount(status: 'good' | 'warning' | 'critical'): number {
    return this.ingredients.filter(ingredient => ingredient.status === status).length;
  }

  // Modal methods - Restock
  openRestockModal(ingredient: Ingredient): void {
    this.restockIngredient = ingredient;
    this.restockQuantity = 1;
    this.restockCost = 0;
    this.showRestockModal = true;
  }

  closeRestockModal(): void {
    this.showRestockModal = false;
    this.restockIngredient = null;
    this.restockQuantity = 1;
    this.restockCost = 0;
  }

  // validateRestock(): void {
  //   if (this.restockIngredient && this.restockQuantity > 0) {
  //     this.restockIngredient.quantity += Number(this.restockQuantity);
  //     this.restockIngredient.status = this.getStockStatus(this.restockIngredient.quantity, this.restockIngredient.restock_threshold);
  //     this.restockIngredient.lastRestock = new Date().toISOString().split('T')[0];
  //     this.updateStatistics();
  //   }
  //   this.closeRestockModal();
  // }

  validateRestock(): void {
    if (this.restockIngredient && this.restockQuantity > 0) {
      this.ingredientService.updateQuantity(this.restockIngredient.id, this.restockQuantity).subscribe({
        next: (response) => {
          if (response.success) {
            // Mise à jour locale des données
            this.restockIngredient!.quantity += Number(this.restockQuantity);
            this.restockIngredient!.status = this.getStockStatus(this.restockIngredient!.quantity, this.restockIngredient!.restock_threshold);
            this.restockIngredient!.lastRestock = new Date().toISOString().split('T')[0];
            this.updateStatistics();
            alert('Quantity updated successfully');
          } else {
            alert('Update failed: ' + response.message);
          }
          this.closeRestockModal();
        },
        error: (err) => {
          console.error('Error updating quantity', err);
          alert('Error updating quantity');
          this.closeRestockModal();
        }
      });
    } else {
      this.closeRestockModal();
    }
  }

  // Modal methods - Add ingredient
  openAddIngredientModal(): void {
    this.  newIngredientForm = {
    name: '',
    type: 'liquide',
    stock: 0,
    limit: 1
  };
    this.showAddIngredientModal = true;
  }

  closeAddIngredientModal(): void {
    this.showAddIngredientModal = false;
  }

  // validateAddIngredient(): void {
  //   if (!this.newIngredientForm.name || this.newIngredientForm.limit <= 0) return;
  //
  //   const newIngredient: Ingredient = {
  //     id: Math.max(0, ...this.ingredients.map(i => i.id)) + 1,
  //     name: this.newIngredientForm.name,
  //     quantity: Number(this.newIngredientForm.stock),
  //     restock_threshold: Number(this.newIngredientForm.limit),
  //     unit: this.newIngredientForm.type === 'liquide' ? 'ml' : 'g',
  //     status: this.getStockStatus(Number(this.newIngredientForm.stock), Number(this.newIngredientForm.limit)),
  //     type: this.newIngredientForm.type,
  //     lastRestock: new Date().toISOString().split('T')[0]
  //   };
  //
  //   this.ingredients.push(newIngredient);
  //   this.updateStatistics();
  //   this.closeAddIngredientModal();
  // }

  validateAddIngredient(): void {
    if (!this.newIngredientForm.name || this.newIngredientForm.limit <= 0) return;

    const newIngredientPayload = {
      name: this.newIngredientForm.name,
      quantity: Number(this.newIngredientForm.stock),
      restock_threshold: Number(this.newIngredientForm.limit),
      unit: this.newIngredientForm.type === 'liquide' ? 'ml' : 'g'
    };

    this.ingredientService.CreateIngredient(newIngredientPayload).subscribe({
      next: (createdIngredient) => {
        // Ajouter l'ingrédient créé dans la liste locale avec les infos reçues
        const ingredient: Ingredient = {
          id: createdIngredient.id || Math.max(0, ...this.ingredients.map(i => i.id)) + 1, // fallback si pas d'id retourné
          name: createdIngredient.name,
          quantity: createdIngredient.quantity,
          restock_threshold: createdIngredient.restock_threshold,
          unit: createdIngredient.unit,
          status: this.getStockStatus(createdIngredient.quantity, createdIngredient.restock_threshold),
          type: this.newIngredientForm.type,
          lastRestock: new Date().toISOString().split('T')[0]
        };

        this.ingredients.push(ingredient);
        this.updateStatistics();
        this.closeAddIngredientModal();
      },
      error: (err) => {
        console.error('Erreur lors de la création de l’ingrédient', err);
        // Optionnel : afficher un message d’erreur à l’utilisateur
      }
    });
  }

  // Modal methods - Edit limit
  openEditLimitModal(ingredient: Ingredient): void {
    this.editLimitIngredient = ingredient;
    this.editLimitValue = ingredient.restock_threshold;
    this.showEditLimitModal = true;
  }

  closeEditLimitModal(): void {
    this.showEditLimitModal = false;
    this.editLimitIngredient = null;
    this.editLimitValue = 1;
  }

  // validateEditLimit(): void {
  //   if (this.editLimitIngredient && this.editLimitValue > 0) {
  //     this.editLimitIngredient.restock_threshold = Number(this.editLimitValue);
  //     this.editLimitIngredient.status = this.getStockStatus(this.editLimitIngredient.quantity, this.editLimitIngredient.restock_threshold);
  //     this.updateStatistics();
  //   }
  //   this.closeEditLimitModal();
  // }

  validateEditLimit(): void {
    if (this.editLimitIngredient && this.editLimitValue > 0) {
      this.ingredientService.updateRestockThreshold(this.editLimitIngredient.id, this.editLimitValue).subscribe({
        next: (response) => {
          if (response.success) {
            // Met à jour localement la valeur et le status
            this.editLimitIngredient!.restock_threshold = Number(this.editLimitValue);
            this.editLimitIngredient!.status = this.getStockStatus(this.editLimitIngredient!.quantity, this.editLimitIngredient!.restock_threshold);
            this.updateStatistics();
            alert('Restock threshold updated successfully');
          } else {
            alert('Update failed: : ' + response.message);
          }
          this.closeEditLimitModal();
        },
        error: (err) => {
          console.error('Error updating restock threshold', err);
          alert('Error updating restock threshold');
          this.closeEditLimitModal();
        }
      });
    }
  }

  // Modal methods - Delete ingredient
  openDeleteModal(ingredient: Ingredient): void {
    this.selectedIngredient = ingredient;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedIngredient = null;
  }

  // confirmDelete(): void {
  //   if (this.selectedIngredient) {
  //     this.ingredients = this.ingredients.filter(ingredient => ingredient.id !== this.selectedIngredient!.id);
  //     this.updateStatistics();
  //   }
  //   this.closeDeleteModal();
  // }

  confirmDelete(): void {
    if (this.selectedIngredient) {
      const id = this.selectedIngredient.id;
      this.ingredientService.deleteIngredient(id).subscribe({
        next: res => {
          alert(res.message);
          this.loadIngredients();
          this.closeDeleteModal();
        },
        error: err => {
          console.error('Erreur lors de la suppression', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  // Modal methods - Details
  openDetailsModal(ingredient: Ingredient): void {
    this.selectedIngredient = ingredient;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedIngredient = null;
  }

  // Utility methods
  getStatusText(status: string): string {
    switch (status) {
      case 'good': return 'OK';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }





  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.getAllFilteredIngredients().length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;

    if (totalPages <= 5) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (current >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', current - 1, current, current + 1, '...', totalPages];
  }

  // Refresh data
  refreshData(): void {
    // In a real app, this would reload data from the server
    this.currentPage = 1;
    this.updateStatistics();
  }
}
