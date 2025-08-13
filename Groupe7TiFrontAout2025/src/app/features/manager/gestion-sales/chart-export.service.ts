import { Injectable } from '@angular/core';

export interface ChartSettings {
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
  responsive: boolean;
  theme: 'light' | 'dark';
  colorScheme: 'default' | 'colorblind' | 'monochrome';
}

@Injectable({
  providedIn: 'root'
})
export class ChartExportService {

  constructor() { }

  // Exporter un graphique individuel
  exportChart(chartId: string, chartTitle: string): void {
    const canvas = document.querySelector(`#${chartId} canvas`) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.download = `${chartTitle}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Exporter tous les graphiques
  exportAllCharts(): void {
    const chartIds = [
      'sales-trend-chart',
      'top-mocktails-chart',
      'sales-distribution-chart',
      'peak-hours-chart',
      'period-comparison-chart'
    ];

    const chartTitles = [
      'Sales_Trend',
      'Top_Selling_Mocktails',
      'Sales_Distribution',
      'Peak_Hours_Analysis',
      'Period_Comparison'
    ];

    // Créer un ZIP avec tous les graphiques
    this.createZipWithCharts(chartIds, chartTitles);
  }

  // Générer un rapport complet
  generateFullReport(salesData: any, kpis: any): void {
    const report = this.createReportContent(salesData, kpis);
    this.downloadReport(report);
  }

  // Créer le contenu du rapport
  private createReportContent(salesData: any, kpis: any): string {
    const now = new Date();
    const reportDate = now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des Ventes - Helha Fresh</title>
    <style>
        body { font-family: 'Quicksand', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .header { background: linear-gradient(135deg, #ff7e5f 0%, #ffb347 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 32px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .kpi-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
        .kpi-value { font-size: 28px; font-weight: bold; color: #ff7e5f; margin: 10px 0; }
        .kpi-label { color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .section { background: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .section h2 { color: #333; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }
        .chart-placeholder { background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 10px; padding: 40px; text-align: center; color: #666; }
        .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Sales Report</h1>
        <p>Generated on ${reportDate} - Helha Fresh Mocktails</p>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-label">Conversion Rate</div>
            <div class="kpi-value">${kpis.conversionRate}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Customer Retention</div>
            <div class="kpi-value">${kpis.customerRetention}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Average Order Value</div>
            <div class="kpi-value">€${kpis.averageOrderValue}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Sales Growth</div>
            <div class="kpi-value">${kpis.salesGrowth > 0 ? '+' : ''}${kpis.salesGrowth}%</div>
        </div>
    </div>

    <div class="section">
        <h2>📈 Sales Trend</h2>
        <div class="chart-placeholder">
            <h3>Sales Trend Chart</h3>
            <p>This chart shows the revenue trend over time.</p>
        </div>
    </div>

    <div class="section">
        <h2>🍹 Best-Selling Mocktails</h2>
        <div class="chart-placeholder">
            <h3>Top Mocktails by Quantity Sold</h3>
            <p>Ranking of the Most Popular Drinks</p>
        </div>
    </div>

    <div class="section">
        <h2>🥧 Sales Distribution</h2>
        <div class="chart-placeholder">
            <h3>Revenue Distribution by Mocktail</h3>
            <p>Sales distribution in percentage</p>
        </div>
    </div>

    <div class="section">
        <h2>⏰ Peak Hours Analysis</h2>
        <div class="chart-placeholder">
            <h3>Sales Activity by Hour</h3>
            <p>Identification of high activity periods</p>
        </div>
    </div>

    <div class="section">
        <h2>📊 Period Comparison</h2>
        <div class="chart-placeholder">
            <h3>Performance Comparison</h3>
            <p>Comparison between different periods</p>
        </div>
    </div>

    <div class="footer">
        <p>Report automatically generated by the Helha Fresh management system</p>
        <p>© 2025 Helha Fresh - All rights reserved</p>
    </div>
</body>
</html>
    `;
  }

  // Télécharger le rapport
  private downloadReport(reportContent: string): void {
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Ventes_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Créer un ZIP avec tous les graphiques
  private async createZipWithCharts(chartIds: string[], chartTitles: string[]): Promise<void> {
    try {
      // Note: Pour une implémentation complète, il faudrait installer une librairie comme JSZip
      // Pour l'instant, on exporte les graphiques un par un
      chartIds.forEach((chartId, index) => {
        setTimeout(() => {
          this.exportChart(chartId, chartTitles[index]);
        }, index * 500); // Délai pour éviter les conflits
      });
    } catch (error) {
      console.error('Erreur lors de la création du ZIP:', error);
      // Fallback: exporter les graphiques un par un
      chartIds.forEach((chartId, index) => {
        this.exportChart(chartId, chartTitles[index]);
      });
    }
  }

  // Obtenir les paramètres par défaut des graphiques
  getDefaultChartSettings(): ChartSettings {
    return {
      showLegend: true,
      showGrid: true,
      animation: true,
      responsive: true,
      theme: 'light',
      colorScheme: 'default'
    };
  }

  // Sauvegarder les paramètres des graphiques
  saveChartSettings(settings: ChartSettings): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('chartSettings', JSON.stringify(settings));
    }
  }

  // Charger les paramètres des graphiques
  loadChartSettings(): ChartSettings {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('chartSettings');
      return saved ? JSON.parse(saved) : this.getDefaultChartSettings();
    }
    return this.getDefaultChartSettings();
  }
}
