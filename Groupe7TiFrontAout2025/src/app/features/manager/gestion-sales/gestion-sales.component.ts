import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Sale {
  date: string;
  total: number;
  mocktails: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
}

@Component({
  selector: 'app-gestion-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-sales.component.html',
  styleUrl: './gestion-sales.component.css'
})
export class GestionSalesComponent implements OnInit {
  
  // Sales history data
  salesHistory: Sale[] = [
    {
      date: '2025-01-10T15:42:00',
      total: 24.50,
      mocktails: [
        { name: 'Virgin Mojito', quantity: 2, price: 8.50 },
        { name: 'Berry Fizz', quantity: 1, price: 8.00 }
      ]
    },
    {
      date: '2025-02-05T14:10:00',
      total: 16.00,
      mocktails: [
        { name: 'Virgin Colada', quantity: 1, price: 9.00 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
      ]
    },
    {
      date: '2025-03-18T19:05:00',
      total: 8.50,
      mocktails: [
        { name: 'Virgin Mojito', quantity: 1, price: 8.50 }
      ]
    },
    {
      date: '2025-04-22T12:30:00',
      total: 18.00,
      mocktails: [
        { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
      ]
    },
    {
      date: '2025-05-15T17:55:00',
      total: 27.70,
      mocktails: [
        { name: 'Tropical Dream', quantity: 2, price: 9.20 },
        { name: 'Green Detox', quantity: 1, price: 8.80 }
      ]
    },
    {
      date: '2025-06-03T20:10:00',
      total: 32.00,
      mocktails: [
        { name: 'Berry Fizz', quantity: 2, price: 8.00 },
        { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
      ]
    },
    {
      date: '2025-06-25T13:20:00',
      total: 12.50,
      mocktails: [
        { name: 'Virgin Colada', quantity: 1, price: 9.00 }
      ]
    },
    {
      date: '2025-07-01T16:30:00',
      total: 45.20,
      mocktails: [
        { name: 'Tropical Dream', quantity: 3, price: 9.20 },
        { name: 'Green Detox', quantity: 2, price: 8.80 }
      ]
    },
    {
      date: '2025-07-02T11:15:00',
      total: 19.50,
      mocktails: [
        { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 },
        { name: 'Berry Fizz', quantity: 1, price: 8.00 }
      ]
    },
    {
      date: '2025-07-03T14:45:00',
      total: 33.80,
      mocktails: [
        { name: 'Virgin Colada', quantity: 2, price: 9.00 },
        { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
      ]
    },
    {
      date: '2025-07-04T09:30:00',
      total: 28.30,
      mocktails: [
        { name: 'Green Detox', quantity: 2, price: 8.80 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
      ]
    },
    {
      date: '2025-07-05T18:20:00',
      total: 41.50,
      mocktails: [
        { name: 'Tropical Dream', quantity: 3, price: 9.20 },
        { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
        { name: 'Berry Fizz', quantity: 1, price: 8.00 }
      ]
    },
    {
      date: '2025-07-06T12:45:00',
      total: 15.60,
      mocktails: [
        { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
      ]
    },
    {
      date: '2025-07-07T20:15:00',
      total: 52.80,
      mocktails: [
        { name: 'Virgin Colada', quantity: 3, price: 9.00 },
        { name: 'Tropical Dream', quantity: 2, price: 9.20 },
        { name: 'Green Detox', quantity: 1, price: 8.80 }
      ]
    },
    {
      date: '2025-07-08T14:30:00',
      total: 22.30,
      mocktails: [
        { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 },
        { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
      ]
    },
    {
      date: '2025-07-09T16:45:00',
      total: 38.90,
      mocktails: [
        { name: 'Berry Fizz', quantity: 3, price: 8.00 },
        { name: 'Green Detox', quantity: 2, price: 8.80 }
      ]
    },
    {
      date: '2025-07-10T11:20:00',
      total: 26.40,
      mocktails: [
        { name: 'Virgin Colada', quantity: 2, price: 9.00 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
      ]
    },
    {
      date: '2025-07-11T19:10:00',
      total: 44.70,
      mocktails: [
        { name: 'Tropical Dream', quantity: 2, price: 9.20 },
        { name: 'Virgin Mojito', quantity: 2, price: 8.50 },
        { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
      ]
    },
    {
      date: '2025-07-12T13:55:00',
      total: 31.20,
      mocktails: [
        { name: 'Green Detox', quantity: 2, price: 8.80 },
        { name: 'Berry Fizz', quantity: 1, price: 8.00 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
      ]
    },
    {
      date: '2025-07-13T17:25:00',
      total: 19.80,
      mocktails: [
        { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
        { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
      ]
    },
    {
      date: '2025-07-14T10:40:00',
      total: 47.60,
      mocktails: [
        { name: 'Tropical Dream', quantity: 3, price: 9.20 },
        { name: 'Virgin Colada', quantity: 2, price: 9.00 }
      ]
    },
    {
      date: '2025-07-15T15:15:00',
      total: 29.90,
      mocktails: [
        { name: 'Green Detox', quantity: 2, price: 8.80 },
        { name: 'Berry Fizz', quantity: 1, price: 8.00 },
        { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
      ]
    }
  ];

  // Filter and search properties
  selectedFilter: 'all' | 'today' | 'week' | 'month' | 'custom' = 'all';
  searchTerm: string = '';
  customDateRange = { start: '', end: '' };
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // UI state
  expandedSaleIndex: number | null = null;
  filteredSales: Sale[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Filter methods
  setFilter(filter: 'all' | 'today' | 'week' | 'month' | 'custom'): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyCustomFilter(): void {
    if (this.customDateRange.start && this.customDateRange.end) {
      this.applyFilters();
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.salesHistory];

    // Apply date filter
    if (this.selectedFilter !== 'all') {
      filtered = this.filterByDate(filtered);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      filtered = this.filterBySearch(filtered);
    }

    this.filteredSales = filtered;
  }

  private filterByDate(sales: Sale[]): Sale[] {
    const now = new Date();
    let start: Date, end: Date;

    switch (this.selectedFilter) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week': {
        const day = (now.getDay() + 6) % 7;
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'custom':
        if (!this.customDateRange.start || !this.customDateRange.end) return sales;
        start = new Date(this.customDateRange.start);
        start.setHours(0, 0, 0, 0);
        end = new Date(this.customDateRange.end);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return sales;
    }

    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }

  private filterBySearch(sales: Sale[]): Sale[] {
    const searchLower = this.searchTerm.toLowerCase();
    return sales.filter(sale => 
      sale.mocktails.some(mocktail => 
        mocktail.name.toLowerCase().includes(searchLower)
      )
    );
  }

  // Getter methods for filtered data
  getFilteredSales(): Sale[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredSales.slice(startIndex, endIndex);
  }

  getFilteredTotal(): number {
    return this.filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }

  getTotalSales(): number {
    return this.salesHistory.reduce((sum, sale) => sum + sale.total, 0);
  }

  getTotalMocktailsSold(): number {
    return this.filteredSales.reduce((sum, sale) => 
      sum + sale.mocktails.reduce((mocktailSum, mocktail) => mocktailSum + mocktail.quantity, 0), 0
    );
  }

  getAverageOrderValue(): number {
    if (this.filteredSales.length === 0) return 0;
    return this.getFilteredTotal() / this.filteredSales.length;
  }

  getFilterPeriodText(): string {
    switch (this.selectedFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'All Time';
    }
  }

  // Sale detail methods
  toggleSaleDetail(index: number): void {
    this.expandedSaleIndex = this.expandedSaleIndex === index ? null : index;
  }

  getSaleItemsCount(sale: Sale): number {
    return sale.mocktails.reduce((sum, mocktail) => sum + mocktail.quantity, 0);
  }

  getSaleMocktailsSummary(sale: Sale): string {
    const uniqueMocktails = sale.mocktails.length;
    const totalItems = this.getSaleItemsCount(sale);
    return `${uniqueMocktails} different mocktail${uniqueMocktails > 1 ? 's' : ''}`;
  }

  getMocktailUnitPrice(sale: Sale, mocktail: any): number {
    if (mocktail.price !== undefined) return mocktail.price;
    // Calculate price if not provided
    const totalQty = sale.mocktails.reduce((sum, m) => sum + m.quantity, 0);
    return totalQty ? sale.total / totalQty : 0;
  }



  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.filteredSales.length / this.itemsPerPage);
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

  // Action methods
  exportSales(): void {
    // Create CSV content
    const headers = ['Date', 'Time', 'Mocktails', 'Total'];
    const csvContent = [
      headers.join(','),
      ...this.filteredSales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        new Date(sale.date).toLocaleTimeString(),
        sale.mocktails.map(m => `${m.name} (x${m.quantity})`).join('; '),
        sale.total.toFixed(2)
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  refreshData(): void {
    // Simulate data refresh
    this.applyFilters();
    this.currentPage = 1;
    this.expandedSaleIndex = null;
  }


}
