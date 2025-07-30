import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataService, Sale } from './chart-data.service';
import { ChartExportService, ChartSettings } from './chart-export.service';
import { ChartSettingsModalComponent } from './chart-settings-modal.component';

import {
  CHART_COLORS,
  LINE_CHART_CONFIG,
  BAR_CHART_CONFIG,
  PIE_CHART_CONFIG,
  RADAR_CHART_CONFIG,
  applyChartSettings,
  getColorScheme
} from './chart-config';
import {SaleService} from '../../../services/sale.service';

// Enregistrer Chart.js avec tous les éléments automatiquement
Chart.register();

@Component({
  selector: 'app-gestion-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, ChartSettingsModalComponent],
  templateUrl: './gestion-sales.component.html',
  styleUrl: './gestion-sales.component.css'
})
export class GestionSalesComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  //
  // // Sales history data
  // salesHistory: Sale[] = [
  //   {
  //     date: '2025-01-10T15:42:00',
  //     total: 24.50,
  //     mocktails: [
  //       { name: 'Virgin Mojito', quantity: 2, price: 8.50 },
  //       { name: 'Berry Fizz', quantity: 1, price: 8.00 }
  //     ]
  //   },
  //   {
  //     date: '2025-02-05T14:10:00',
  //     total: 16.00,
  //     mocktails: [
  //       { name: 'Virgin Colada', quantity: 1, price: 9.00 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-03-18T19:05:00',
  //     total: 8.50,
  //     mocktails: [
  //       { name: 'Virgin Mojito', quantity: 1, price: 8.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-04-22T12:30:00',
  //     total: 18.00,
  //     mocktails: [
  //       { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-05-15T17:55:00',
  //     total: 27.70,
  //     mocktails: [
  //       { name: 'Tropical Dream', quantity: 2, price: 9.20 },
  //       { name: 'Green Detox', quantity: 1, price: 8.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-06-03T20:10:00',
  //     total: 32.00,
  //     mocktails: [
  //       { name: 'Berry Fizz', quantity: 2, price: 8.00 },
  //       { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-06-25T13:20:00',
  //     total: 12.50,
  //     mocktails: [
  //       { name: 'Virgin Colada', quantity: 1, price: 9.00 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-01T16:30:00',
  //     total: 45.20,
  //     mocktails: [
  //       { name: 'Tropical Dream', quantity: 3, price: 9.20 },
  //       { name: 'Green Detox', quantity: 2, price: 8.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-02T11:15:00',
  //     total: 19.50,
  //     mocktails: [
  //       { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 },
  //       { name: 'Berry Fizz', quantity: 1, price: 8.00 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-03T14:45:00',
  //     total: 33.80,
  //     mocktails: [
  //       { name: 'Virgin Colada', quantity: 2, price: 9.00 },
  //       { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-04T09:30:00',
  //     total: 28.30,
  //     mocktails: [
  //       { name: 'Green Detox', quantity: 2, price: 8.80 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-05T18:20:00',
  //     total: 41.50,
  //     mocktails: [
  //       { name: 'Tropical Dream', quantity: 3, price: 9.20 },
  //       { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
  //       { name: 'Berry Fizz', quantity: 1, price: 8.00 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-06T12:45:00',
  //     total: 15.60,
  //     mocktails: [
  //       { name: 'Sunset Spritz', quantity: 2, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-07T20:15:00',
  //     total: 52.80,
  //     mocktails: [
  //       { name: 'Virgin Colada', quantity: 3, price: 9.00 },
  //       { name: 'Tropical Dream', quantity: 2, price: 9.20 },
  //       { name: 'Green Detox', quantity: 1, price: 8.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-08T14:30:00',
  //     total: 22.30,
  //     mocktails: [
  //       { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 },
  //       { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-09T16:45:00',
  //     total: 38.90,
  //     mocktails: [
  //       { name: 'Berry Fizz', quantity: 3, price: 8.00 },
  //       { name: 'Green Detox', quantity: 2, price: 8.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-10T11:20:00',
  //     total: 26.40,
  //     mocktails: [
  //       { name: 'Virgin Colada', quantity: 2, price: 9.00 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-11T19:10:00',
  //     total: 44.70,
  //     mocktails: [
  //       { name: 'Tropical Dream', quantity: 2, price: 9.20 },
  //       { name: 'Virgin Mojito', quantity: 2, price: 8.50 },
  //       { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-12T13:55:00',
  //     total: 31.20,
  //     mocktails: [
  //       { name: 'Green Detox', quantity: 2, price: 8.80 },
  //       { name: 'Berry Fizz', quantity: 1, price: 8.00 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-13T17:25:00',
  //     total: 19.80,
  //     mocktails: [
  //       { name: 'Virgin Mojito', quantity: 1, price: 8.50 },
  //       { name: 'Sunset Spritz', quantity: 1, price: 7.50 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-14T10:40:00',
  //     total: 47.60,
  //     mocktails: [
  //       { name: 'Tropical Dream', quantity: 3, price: 9.20 },
  //       { name: 'Virgin Colada', quantity: 2, price: 9.00 }
  //     ]
  //   },
  //   {
  //     date: '2025-07-15T15:15:00',
  //     total: 29.90,
  //     mocktails: [
  //       { name: 'Green Detox', quantity: 2, price: 8.80 },
  //       { name: 'Berry Fizz', quantity: 1, price: 8.00 },
  //       { name: 'Pink Lemonade', quantity: 1, price: 7.80 }
  //     ]
  //   }
  // ];

  sales: Sale[] = [];
  // Filtres et pagination
  selectedFilter: 'all' | 'today' | 'week' | 'month' | 'custom' = 'all';
  searchTerm: string = '';
  customDateRange = { start: '', end: '' };

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Sale details
  expandedSaleIndex: number | null = null;
  filteredSales: Sale[] = [];
  displayMode: 'list' | 'statistics' = 'list'; //   Nouveau: mode d'affichage

  // Graphiques avec configuration de base
  salesTrendChart: any = { ...LINE_CHART_CONFIG };
  topMocktailsChart: any = { ...BAR_CHART_CONFIG };
  salesDistributionChart: any = { ...PIE_CHART_CONFIG };
  peakHoursChart: any = { ...RADAR_CHART_CONFIG };
  periodComparisonChart: any = { ...BAR_CHART_CONFIG };

  // KPIs
  salesGrowth: { growth: number; isPositive: boolean; trend: string } = { growth: 0, isPositive: true, trend: '📈' };
  customerRetention: { retention: number; trend: string } = { retention: 0, trend: '📈' };
  conversionRate: { conversion: number; trend: string } = { conversion: 0, trend: '📈' };

  // Paramètres des graphiques
  chartSettings: ChartSettings;
  showSettingsModal: boolean = false;

  constructor(
    private router: Router,
    private chartDataService: ChartDataService,
    private chartExportService: ChartExportService,
    private saleService: SaleService
  ) {
    // Initialiser les paramètres des graphiques avec les valeurs par défaut
    this.chartSettings = this.chartExportService.getDefaultChartSettings();
  }

  ngOnInit(): void {
    // Charger les paramètres sauvegardés s'ils existent (côté client uniquement)
    const savedSettings = this.chartExportService.loadChartSettings();
    if (savedSettings) {
      this.chartSettings = { ...this.chartSettings, ...savedSettings };
    }
    this.loadSales();
    this.applyFilters();
    this.updateCharts();
    this.updateKPIs();
  }

  loadSales(): void {
    this.saleService.getAllSales().subscribe({
      next: (response) => {
        console.log('Données des ventes reçues:', response.sales)
        this.sales = response.sales;
        this.filteredSales = [...this.sales];
        this.applyFilters();
        if (this.displayMode === 'statistics') {
          this.updateCharts();
          this.updateKPIs();
        }
      },
      error: (err) => console.error('Error loading sales:', err)
    });
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Mode d'affichage
  setDisplayMode(mode: 'list' | 'statistics'): void {
    this.displayMode = mode;
    if (mode === 'statistics') {
      this.updateCharts();
      this.updateKPIs();
    }
  }

  // Filter methods
  setFilter(filter: 'all' | 'today' | 'week' | 'month' | 'custom'): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
    if (this.displayMode === 'statistics') {
      this.updateCharts();
      this.updateKPIs();
    }
  }

  applyCustomFilter(): void {
    if (this.customDateRange.start && this.customDateRange.end) {
      this.applyFilters();
      if (this.displayMode === 'statistics') {
        this.updateCharts();
        this.updateKPIs();
      }
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
    if (this.displayMode === 'statistics') {
      this.updateCharts();
      this.updateKPIs();
    }
  }

  private applyFilters(): void {
    let filtered = [...this.sales];

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
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end;
    });
  }

  private filterBySearch(sales: Sale[]): Sale[] {
    const searchLower = this.searchTerm.toLowerCase();
    return sales.filter(sale =>
      sale.items.some(mocktail =>
        mocktail.mocktailName.toLowerCase().includes(searchLower)
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
    return this.filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }

  getTotalSales(): number {
    return this.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }

  getTotalMocktailsSold() {
    if (!this.sales) return 0; // ou [] pour un tableau vide

    return this.sales.reduce((acc, sale) => acc + (sale.items?.length || 0), 0);
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
  if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, mocktail) => sum + mocktail.quantity, 0);
  }

  getSaleMocktailsSummary(sale: Sale): string {
    if (!sale || !sale.items || sale.items.length === 0) return 'No mocktails sold';
    const uniqueMocktails = sale.items.length;
    const totalItems = this.getSaleItemsCount(sale);
    return `${uniqueMocktails} different mocktail${uniqueMocktails > 1 ? 's' : ''}`;
  }

  getMocktailUnitPrice(sale: Sale, mocktail: any): number {
    if (mocktail.price !== undefined) return mocktail.price;
    // Calculate price if not provided
    const totalQty = sale.items.reduce((sum, m) => sum + m.quantity, 0);
    return totalQty ? sale.totalAmount / totalQty : 0;
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
    const headers = ['Date', 'Time', 'Mocktails', 'Total'];
    const csvContent = [
      headers.join(','),
      ...this.filteredSales.map(sale => [
        new Date(sale.saleDate).toLocaleDateString(),
        new Date(sale.saleDate).toLocaleTimeString(),
        sale.items.map(m => `${m.mocktailName} (x${m.quantity})`).join('; '),
        (sale.totalAmount ?? 0).toFixed(2)  // <-- Ici on met 0 si total est undefined
      ].join(','))
    ].join('\n');

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

  // Mise à jour des graphiques
  private updateCharts(): void {
    const filteredSales = this.getFilteredSales();

    // Préparer les données avec les paramètres actuels
    const salesTrendData = this.chartDataService.prepareSalesTrendData(filteredSales, 'day', this.chartSettings);
    const topMocktailsData = this.chartDataService.prepareTopMocktailsData(filteredSales, this.chartSettings);
    const salesDistributionData = this.chartDataService.prepareSalesDistributionData(filteredSales, this.chartSettings);
    const peakHoursData = this.chartDataService.preparePeakHoursData(filteredSales, this.chartSettings);
    const periodComparisonData = this.chartDataService.preparePeriodComparisonData(filteredSales, this.chartSettings);

    // Appliquer les paramètres aux graphiques
    this.salesTrendChart = applyChartSettings(LINE_CHART_CONFIG, this.chartSettings);
    this.salesTrendChart.data = salesTrendData;

    this.topMocktailsChart = applyChartSettings(BAR_CHART_CONFIG, this.chartSettings);
    this.topMocktailsChart.data = topMocktailsData;

    this.salesDistributionChart = applyChartSettings(PIE_CHART_CONFIG, this.chartSettings);
    this.salesDistributionChart.data = salesDistributionData;

    this.peakHoursChart = applyChartSettings(RADAR_CHART_CONFIG, this.chartSettings);
    this.peakHoursChart.data = peakHoursData;

    this.periodComparisonChart = applyChartSettings(BAR_CHART_CONFIG, this.chartSettings);
    this.periodComparisonChart.data = periodComparisonData;
  }

  // Mise à jour des KPIs
  private updateKPIs(): void {
    const filteredSales = this.getFilteredSales();

    this.salesGrowth = this.chartDataService.calculateSalesGrowth(filteredSales);
    this.customerRetention = this.chartDataService.calculateCustomerRetention(filteredSales);
    this.conversionRate = this.chartDataService.calculateConversionRate(filteredSales);
  }

  // Méthodes pour les boutons d'export et de paramètres
  exportChart(chartId: string, chartTitle: string): void {
    this.chartExportService.exportChart(chartId, chartTitle);
  }

  exportAllCharts(): void {
    this.chartExportService.exportAllCharts();
  }



  openChartSettings(): void {
    console.log('Opening chart settings modal');
    this.showSettingsModal = true;
  }

  closeChartSettings(): void {
    console.log('Closing chart settings modal');
    this.showSettingsModal = false;
  }

  onSettingsChange(settings: ChartSettings): void {
    console.log('Settings changed:', settings);
    this.chartSettings = { ...settings };
    this.chartExportService.saveChartSettings(settings);
    // Appliquer les nouveaux paramètres aux graphiques
    this.applyChartSettings();
  }

  private applyChartSettings(): void {
    // Appliquer les paramètres aux graphiques existants
    if (this.displayMode === 'statistics') {
      this.updateCharts();
    }
  }


}
