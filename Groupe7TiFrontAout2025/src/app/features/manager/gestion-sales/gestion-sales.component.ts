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

  // Autocomplétion de recherche
  showSuggestions: boolean = false;
  filteredSuggestions: string[] = [];
  allMocktailNames: string[] = [];

  // Graphiques avec configuration de base
  salesTrendChart: any = { ...LINE_CHART_CONFIG };
  topMocktailsChart: any = { ...BAR_CHART_CONFIG };
  salesDistributionChart: any = { ...PIE_CHART_CONFIG };
  peakHoursChart: any = { ...RADAR_CHART_CONFIG };
  periodComparisonChart: any = { ...BAR_CHART_CONFIG };
  salesByTableChart: any = { ...PIE_CHART_CONFIG };

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

  totalAllOrders: number = 0;

// Modifiez loadSales()
  loadSales(): void {
    console.log('🔄 Chargement des ventes...');
    this.saleService.getAllSales().subscribe({
      next: (response) => {
        console.log('✅ Réponse getAllSales:', response);
        console.log('✅ Type de response:', typeof response);
        console.log('✅ Keys de response:', Object.keys(response));

        // Le backend renvoie { Sales: [...] } avec S majuscule
        const backendSales = response.Sales || response.sales || [];

        // Transformer les données du backend vers le format frontend
        this.sales = backendSales.map((sale: any) => ({
          saleDate: sale.SaleDate || sale.saleDate,
          totalAmount: sale.TotalAmount || sale.totalAmount,
          tableNumber: sale.TableNumber || sale.tableNumber,
          items: (sale.Items || sale.items || []).map((item: any) => ({
            mocktailName: item.MocktailName || item.mocktailName,
            quantity: item.Quantity || item.quantity,
            price: item.UnitPrice || item.unitPrice
          }))
        }));

        this.totalAllOrders = this.sales.length; // Total TOUTES pages
        this.filteredSales = [...this.sales];
        this.extractMocktailNames(); // Extraire les noms de mocktails pour l'autocomplétion
        this.applyFilters();

        console.log('📊 Total commandes:', this.totalAllOrders);
        console.log('📋 Sales array:', this.sales);
      },
      error: (err) => {
        console.error('❌ Erreur chargement ventes:', err);
        console.error('❌ Détails:', err.error);
      }
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
    this.updateSuggestions();
    if (this.displayMode === 'statistics') {
      this.updateCharts();
      this.updateKPIs();
    }
  }

  onSearchBlur(): void {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.showSuggestions = false;
    this.onSearchChange();
  }

  private updateSuggestions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSuggestions = [];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredSuggestions = this.allMocktailNames
      .filter(name => name.toLowerCase().includes(searchLower))
      .slice(0, 5); // Limiter à 5 suggestions
  }

  private extractMocktailNames(): void {
    const mocktailSet = new Set<string>();
    this.sales.forEach(sale => {
      sale.items.forEach(item => {
        mocktailSet.add(item.mocktailName);
      });
    });
    this.allMocktailNames = Array.from(mocktailSet).sort();
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
    if (!this.filteredSales) return 0; // ou [] pour un tableau vide

    return this.filteredSales.reduce((acc, sale) => acc + (sale.items?.length || 0), 0);
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
    // Recharger les données depuis le serveur
    this.loadSales();
    this.applyFilters();
    this.currentPage = 1;
    this.expandedSaleIndex = null;
  }



  // Mise à jour des graphiques
  private updateCharts(): void {
    // Utiliser toutes les données filtrées, pas seulement la page courante
    const filteredSales = this.filteredSales;

    // Préparer les données avec les paramètres actuels
    const salesTrendData = this.chartDataService.prepareSalesTrendData(filteredSales, 'day', this.chartSettings);
    const topMocktailsData = this.chartDataService.prepareTopMocktailsData(filteredSales, this.chartSettings);
    const salesDistributionData = this.chartDataService.prepareSalesDistributionData(filteredSales, this.chartSettings);
    const peakHoursData = this.chartDataService.preparePeakHoursData(filteredSales, this.chartSettings);
    const periodComparisonData = this.chartDataService.preparePeriodComparisonData(filteredSales, this.chartSettings);
    const salesByTableData = this.chartDataService.prepareSalesByTableData(filteredSales, this.chartSettings);

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

    this.salesByTableChart = applyChartSettings(PIE_CHART_CONFIG, this.chartSettings);
    this.salesByTableChart.data = salesByTableData;
  }

  // Mise à jour des KPIs
  private updateKPIs(): void {
    // Utiliser toutes les données filtrées, pas seulement la page courante
    const filteredSales = this.filteredSales;

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
