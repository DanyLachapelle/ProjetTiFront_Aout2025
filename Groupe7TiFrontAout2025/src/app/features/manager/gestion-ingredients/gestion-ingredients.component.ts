import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Ingredient {
  id: number;
  name: string;
  stock: number;
  limit: number;
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

  // Ingredients data
  ingredients: Ingredient[] = [
    { id: 1, name: 'Fresh Mint', stock: 40, limit: 50, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-15' },
    { id: 2, name: 'Lime', stock: 120, limit: 100, unit: 'g', status: 'good', type: 'solide', lastRestock: '2025-01-20' },
    { id: 3, name: 'Sugar Syrup', stock: 800, limit: 500, unit: 'ml', status: 'good', type: 'liquide', lastRestock: '2025-01-18' },
    { id: 4, name: 'Pineapple Juice', stock: 200, limit: 300, unit: 'ml', status: 'warning', type: 'liquide', lastRestock: '2025-01-22' },
    { id: 5, name: 'Coconut', stock: 30, limit: 50, unit: 'g', status: 'critical', type: 'solide', lastRestock: '2025-01-10' },
    { id: 6, name: 'Strawberry', stock: 80, limit: 100, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-25' },
    { id: 7, name: 'Blueberry', stock: 150, limit: 120, unit: 'g', status: 'good', type: 'solide', lastRestock: '2025-01-23' },
    { id: 8, name: 'Lemon Juice', stock: 400, limit: 350, unit: 'ml', status: 'good', type: 'liquide', lastRestock: '2025-01-21' },
    { id: 9, name: 'Ginger', stock: 25, limit: 40, unit: 'g', status: 'critical', type: 'solide', lastRestock: '2025-01-12' },
    { id: 10, name: 'Honey', stock: 300, limit: 250, unit: 'ml', status: 'good', type: 'liquide', lastRestock: '2025-01-19' },
    { id: 11, name: 'Orange Juice', stock: 350, limit: 400, unit: 'ml', status: 'good', type: 'liquide', lastRestock: '2025-01-24' },
    { id: 12, name: 'Basil', stock: 35, limit: 45, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-16' },
    { id: 13, name: 'Grapefruit Juice', stock: 180, limit: 250, unit: 'ml', status: 'warning', type: 'liquide', lastRestock: '2025-01-17' },
    { id: 14, name: 'Raspberry', stock: 60, limit: 80, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-26' },
    { id: 15, name: 'Cinnamon', stock: 15, limit: 25, unit: 'g', status: 'critical', type: 'solide', lastRestock: '2025-01-08' },
    { id: 16, name: 'Coconut Milk', stock: 250, limit: 300, unit: 'ml', status: 'good', type: 'liquide', lastRestock: '2025-01-20' },
    { id: 17, name: 'Vanilla Extract', stock: 45, limit: 60, unit: 'ml', status: 'warning', type: 'liquide', lastRestock: '2025-01-14' },
    { id: 18, name: 'Mango', stock: 90, limit: 120, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-27' },
    { id: 19, name: 'Peach', stock: 75, limit: 100, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-28' },
    { id: 20, name: 'Almond Syrup', stock: 120, limit: 150, unit: 'ml', status: 'warning', type: 'liquide', lastRestock: '2025-01-13' },
    { id: 21, name: 'Passion Fruit', stock: 40, limit: 60, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-29' },
    { id: 22, name: 'Rose Water', stock: 80, limit: 100, unit: 'ml', status: 'warning', type: 'liquide', lastRestock: '2025-01-11' },
    { id: 23, name: 'Lavender', stock: 20, limit: 30, unit: 'g', status: 'critical', type: 'solide', lastRestock: '2025-01-09' },
    { id: 24, name: 'Chamomile', stock: 30, limit: 40, unit: 'g', status: 'warning', type: 'solide', lastRestock: '2025-01-07' },
    { id: 25, name: 'Elderflower', stock: 25, limit: 35, unit: 'g', status: 'critical', type: 'solide', lastRestock: '2025-01-06' }
  ];

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateStatistics();
  }

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
          aValue = a.stock;
          bValue = b.stock;
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

  validateRestock(): void {
    if (this.restockIngredient && this.restockQuantity > 0) {
      this.restockIngredient.stock += Number(this.restockQuantity);
      this.restockIngredient.status = this.getStockStatus(this.restockIngredient.stock, this.restockIngredient.limit);
      this.restockIngredient.lastRestock = new Date().toISOString().split('T')[0];
      this.updateStatistics();
    }
    this.closeRestockModal();
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

  validateAddIngredient(): void {
    if (!this.newIngredientForm.name || this.newIngredientForm.limit <= 0) return;
    
    const newIngredient: Ingredient = {
      id: Math.max(0, ...this.ingredients.map(i => i.id)) + 1,
      name: this.newIngredientForm.name,
      stock: Number(this.newIngredientForm.stock),
      limit: Number(this.newIngredientForm.limit),
      unit: this.newIngredientForm.type === 'liquide' ? 'ml' : 'g',
      status: this.getStockStatus(Number(this.newIngredientForm.stock), Number(this.newIngredientForm.limit)),
      type: this.newIngredientForm.type,
      lastRestock: new Date().toISOString().split('T')[0]
    };
    
    this.ingredients.push(newIngredient);
    this.updateStatistics();
    this.closeAddIngredientModal();
  }

  // Modal methods - Edit limit
  openEditLimitModal(ingredient: Ingredient): void {
    this.editLimitIngredient = ingredient;
    this.editLimitValue = ingredient.limit;
    this.showEditLimitModal = true;
  }

  closeEditLimitModal(): void {
    this.showEditLimitModal = false;
    this.editLimitIngredient = null;
    this.editLimitValue = 1;
  }

  validateEditLimit(): void {
    if (this.editLimitIngredient && this.editLimitValue > 0) {
      this.editLimitIngredient.limit = Number(this.editLimitValue);
      this.editLimitIngredient.status = this.getStockStatus(this.editLimitIngredient.stock, this.editLimitIngredient.limit);
      this.updateStatistics();
    }
    this.closeEditLimitModal();
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

  confirmDelete(): void {
    if (this.selectedIngredient) {
      this.ingredients = this.ingredients.filter(ingredient => ingredient.id !== this.selectedIngredient!.id);
      this.updateStatistics();
    }
    this.closeDeleteModal();
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
