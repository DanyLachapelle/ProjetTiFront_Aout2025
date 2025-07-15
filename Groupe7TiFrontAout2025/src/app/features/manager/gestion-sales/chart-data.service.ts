import { Injectable } from '@angular/core';
import { CHART_COLORS, DARK_CHART_COLORS, getColorScheme } from './chart-config';
import { ChartSettings } from './chart-export.service';

export interface Sale {
  date: string;
  total: number;
  mocktails: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  constructor() { }

  // Préparer les données pour le graphique des ventes par période
  prepareSalesTrendData(sales: Sale[], period: 'day' | 'week' | 'month' = 'day', settings?: ChartSettings) {
    const colors = this.getColors(settings);
    
    if (sales.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Revenue (€)',
          data: [0],
          borderColor: colors.primary,
          backgroundColor: colors.primary + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      };
    }

    const groupedData = this.groupSalesByPeriod(sales, period);
    
    return {
      labels: Object.keys(groupedData),
      datasets: [{
        label: 'Revenue (€)',
        data: Object.values(groupedData),
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  }

  // Préparer les données pour le graphique des mocktails les plus vendus
  prepareTopMocktailsData(sales: Sale[], settings?: ChartSettings) {
    const colors = this.getColors(settings);
    const colorScheme = getColorScheme(settings || this.getDefaultSettings());
    
    if (sales.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Quantity Sold',
          data: [0],
          backgroundColor: colorScheme,
          borderColor: colors.primary,
          borderWidth: 2,
          borderRadius: 8
        }]
      };
    }

    const mocktailStats = this.getMocktailStatistics(sales);
    const sortedMocktails = Object.entries(mocktailStats)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 8); // Top 8

    // Utiliser les couleurs appropriées selon le schéma
    const backgroundColor = settings?.colorScheme === 'monochrome' 
      ? colorScheme.slice(0, sortedMocktails.length)
      : colorScheme;

    return {
      labels: sortedMocktails.map(([name]) => name),
      datasets: [{
        label: 'Quantity Sold',
        data: sortedMocktails.map(([, stats]) => stats.quantity),
        backgroundColor: backgroundColor,
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  }

  // Préparer les données pour le graphique de répartition des ventes
  prepareSalesDistributionData(sales: Sale[], settings?: ChartSettings) {
    const colors = this.getColors(settings);
    const colorScheme = getColorScheme(settings || this.getDefaultSettings());
    
    if (sales.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Revenue (€)',
          data: [1],
          backgroundColor: colorScheme,
          borderColor: '#fff',
          borderWidth: 2
        }]
      };
    }

    const mocktailStats = this.getMocktailStatistics(sales);
    const sortedMocktails = Object.entries(mocktailStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue);

    // Pour les graphiques circulaires, utiliser le schéma de couleurs complet
    const backgroundColor = settings?.colorScheme === 'monochrome' 
      ? colorScheme 
      : colorScheme.slice(0, sortedMocktails.length);

    return {
      labels: sortedMocktails.map(([name]) => name),
      datasets: [{
        label: 'Revenue (€)',
        data: sortedMocktails.map(([, stats]) => stats.revenue),
        backgroundColor: backgroundColor,
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }

  // Préparer les données pour le graphique des heures de pointe
  preparePeakHoursData(sales: Sale[], settings?: ChartSettings) {
    const colors = this.getColors(settings);
    
    if (sales.length === 0) {
      return {
        labels: ['00:00', '06:00', '12:00', '18:00'],
        datasets: [{
          label: 'Sales Activity',
          data: [0, 0, 0, 0],
          borderColor: colors.secondary,
          backgroundColor: colors.secondary + '20',
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      };
    }

    const hourlyData = this.getHourlySalesData(sales);
    
    return {
      labels: Object.keys(hourlyData),
      datasets: [{
        label: 'Sales Activity',
        data: Object.values(hourlyData),
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '20',
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: colors.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };
  }

  // Préparer les données pour la comparaison de périodes
  preparePeriodComparisonData(sales: Sale[], settings?: ChartSettings) {
    const colors = this.getColors(settings);
    
    // Si pas de données, retourner des données vides
    if (sales.length === 0) {
      return {
        labels: ['Current Period', 'Previous Period'],
        datasets: [{
          label: 'Total Revenue (€)',
          data: [0, 0],
          backgroundColor: [colors.primary, colors.secondary],
          borderColor: [colors.primary, colors.secondary],
          borderWidth: 2
        }, {
          label: 'Number of Orders',
          data: [0, 0],
          backgroundColor: [colors.accent, colors.info],
          borderColor: [colors.accent, colors.info],
          borderWidth: 2
        }]
      };
    }

    // Diviser les données en deux périodes égales pour une comparaison équitable
    const sortedSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midPoint = Math.ceil(sortedSales.length / 2);
    
    const firstPeriod = sortedSales.slice(0, midPoint);
    const secondPeriod = sortedSales.slice(midPoint);
    
    const firstPeriodTotal = firstPeriod.reduce((sum, sale) => sum + sale.total, 0);
    const secondPeriodTotal = secondPeriod.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      labels: ['First Half', 'Second Half'],
      datasets: [{
        label: 'Total Revenue (€)',
        data: [firstPeriodTotal, secondPeriodTotal],
        backgroundColor: [colors.primary, colors.secondary],
        borderColor: [colors.primary, colors.secondary],
        borderWidth: 2
      }, {
        label: 'Number of Orders',
        data: [firstPeriod.length, secondPeriod.length],
        backgroundColor: [colors.accent, colors.info],
        borderColor: [colors.accent, colors.info],
        borderWidth: 2
      }]
    };
  }

  // Calculer le Sales Growth (croissance des ventes)
  calculateSalesGrowth(sales: Sale[]): { growth: number; isPositive: boolean; trend: string } {
    // Si pas assez de données, retourner 0
    if (sales.length < 2) {
      return {
        growth: 0,
        isPositive: true,
        trend: '➖'
      };
    }

    // Utiliser la même logique que la comparaison des périodes
    const sortedSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midPoint = Math.ceil(sortedSales.length / 2);
    
    const firstPeriod = sortedSales.slice(0, midPoint);
    const secondPeriod = sortedSales.slice(midPoint);
    
    const firstPeriodTotal = firstPeriod.reduce((sum, sale) => sum + sale.total, 0);
    const secondPeriodTotal = secondPeriod.reduce((sum, sale) => sum + sale.total, 0);
    
    // Éviter la division par zéro
    if (firstPeriodTotal === 0) {
      return {
        growth: secondPeriodTotal > 0 ? 100 : 0,
        isPositive: secondPeriodTotal > 0,
        trend: secondPeriodTotal > 0 ? '📈' : '➖'
      };
    }
    
    // Calculer le pourcentage de croissance
    const growth = ((secondPeriodTotal - firstPeriodTotal) / firstPeriodTotal) * 100;
    
    return {
      growth: Math.round(growth * 100) / 100, // Arrondir à 2 décimales
      isPositive: growth >= 0,
      trend: growth > 0 ? '📈' : growth < 0 ? '📉' : '➖'
    };
  }

  // Calculer le Customer Retention (rétention client)
  calculateCustomerRetention(sales: Sale[]): { retention: number; trend: string } {
    // Si pas de données, retourner 0
    if (sales.length === 0) {
      return {
        retention: 0,
        trend: '➖'
      };
    }

    // Logique simplifiée : pourcentage de clients qui ont commandé plus d'une fois
    const customerOrders = new Map<string, number>();
    
    sales.forEach(sale => {
      // Utiliser la date comme identifiant client simplifié
      const customerId = sale.date.split('T')[0]; // Date sans heure
      customerOrders.set(customerId, (customerOrders.get(customerId) || 0) + 1);
    });
    
    const totalCustomers = customerOrders.size;
    const returningCustomers = Array.from(customerOrders.values()).filter(orders => orders > 1).length;
    
    const retention = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    
    return {
      retention: Math.round(retention * 100) / 100,
      trend: retention > 50 ? '📈' : retention > 25 ? '➖' : '📉'
    };
  }

  // Calculer le Conversion Rate (taux de conversion)
  calculateConversionRate(sales: Sale[]): { conversion: number; trend: string } {
    // Si pas de données, retourner 0
    if (sales.length === 0) {
      return {
        conversion: 0,
        trend: '➖'
      };
    }

    // Logique simplifiée : pourcentage de jours avec ventes vs jours sans ventes
    const daysWithSales = new Set<string>();
    
    // Déterminer la période basée sur les données
    const dates = sales.map(sale => new Date(sale.date)).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    // Calculer le nombre total de jours dans la période
    const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    sales.forEach(sale => {
      const saleDate = sale.date.split('T')[0];
      daysWithSales.add(saleDate);
    });
    
    const conversion = totalDays > 0 ? (daysWithSales.size / totalDays) * 100 : 0;
    
    return {
      conversion: Math.round(conversion * 100) / 100,
      trend: conversion > 70 ? '📈' : conversion > 40 ? '➖' : '📉'
    };
  }

  // Méthodes utilitaires privées
  private groupSalesByPeriod(sales: Sale[], period: 'day' | 'week' | 'month') {
    const grouped: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      let key: string;
      
      switch (period) {
        case 'day':
          key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `Week ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
          break;
        case 'month':
          key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          break;
      }
      
      grouped[key] = (grouped[key] || 0) + sale.total;
    });
    
    return grouped;
  }

  private getMocktailStatistics(sales: Sale[]) {
    const stats: { [key: string]: { quantity: number; revenue: number } } = {};
    
    sales.forEach(sale => {
      sale.mocktails.forEach(mocktail => {
        if (!stats[mocktail.name]) {
          stats[mocktail.name] = { quantity: 0, revenue: 0 };
        }
        stats[mocktail.name].quantity += mocktail.quantity;
        stats[mocktail.name].revenue += (mocktail.price || 0) * mocktail.quantity;
      });
    });
    
    return stats;
  }

  private getHourlySalesData(sales: Sale[]) {
    const hourly: { [key: string]: number } = {};
    
    // Initialiser toutes les heures
    for (let i = 0; i < 24; i++) {
      hourly[`${i.toString().padStart(2, '0')}:00`] = 0;
    }
    
    sales.forEach(sale => {
      const hour = new Date(sale.date).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourly[hourKey] += sale.total;
    });
    
    return hourly;
  }

  private getCurrentPeriodSales(sales: Sale[]) {
    // Si pas de données, retourner des valeurs par défaut
    if (sales.length === 0) {
      return { total: 0, count: 0 };
    }

    const now = new Date();
    const currentPeriodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Dernière semaine
    });
    
    return {
      total: currentPeriodSales.reduce((sum, sale) => sum + sale.total, 0),
      count: currentPeriodSales.length
    };
  }

  private getPreviousPeriodSales(sales: Sale[]) {
    // Si pas de données, retourner des valeurs par défaut
    if (sales.length === 0) {
      return { total: 0, count: 0 };
    }

    const now = new Date();
    const previousPeriodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7 && diffDays <= 14; // Semaine précédente
    });
    
    return {
      total: previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0),
      count: previousPeriodSales.length
    };
  }

  // Méthodes utilitaires pour obtenir les couleurs
  private getColors(settings?: ChartSettings) {
    if (!settings) return CHART_COLORS;
    return settings.theme === 'dark' ? DARK_CHART_COLORS : CHART_COLORS;
  }

  private getDefaultSettings(): ChartSettings {
    return {
      showLegend: true,
      showGrid: true,
      animation: true,
      responsive: true,
      theme: 'light',
      colorScheme: 'default'
    };
  }
} 