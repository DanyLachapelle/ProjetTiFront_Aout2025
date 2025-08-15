// Custom colors for charts
export const CHART_COLORS = {
  primary: '#ff7e5f',
  secondary: '#ffb347',
  accent: '#ffe066',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40',
  gradient: ['#ff7e5f', '#ffb347', '#ffe066', '#28a745', '#17a2b8']
};

// Colors for dark theme
export const DARK_CHART_COLORS = {
  primary: '#ffb347',
  secondary: '#ff7e5f',
  accent: '#ffe066',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#495057',
  dark: '#f8f9fa',
  gradient: ['#ffb347', '#ff7e5f', '#ffe066', '#28a745', '#17a2b8']
};

// Global configuration for all charts
export const CHART_GLOBAL_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: 'Quicksand, Arial, sans-serif',
          size: 12
        },
        color: '#666'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: CHART_COLORS.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: 'Quicksand, Arial, sans-serif',
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        family: 'Quicksand, Arial, sans-serif',
        size: 12
      }
    }
  }
};

// Configuration for line charts (Sales Trend)
export const LINE_CHART_CONFIG = {
  type: 'line' as const,
  data: {
    labels: [] as string[],
    datasets: [] as any[]
  },
  options: {
    ...CHART_GLOBAL_CONFIG,
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: CHART_COLORS.primary,
        borderColor: '#fff',
        borderWidth: 2
      }
    }
  }
};

//Configuration for bar charts (Top Selling Mocktails)
export const BAR_CHART_CONFIG = {
  type: 'bar' as const,
  data: {
    labels: [] as string[],
    datasets: [] as any[]
  },
  options: {
    ...CHART_GLOBAL_CONFIG,
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    }
  }
};

// Configuration for pie charts (Sales Distribution)
export const PIE_CHART_CONFIG = {
  type: 'pie' as const,
  data: {
    labels: [] as string[],
    datasets: [] as any[]
  },
  options: {
    ...CHART_GLOBAL_CONFIG,
    plugins: {
      ...CHART_GLOBAL_CONFIG.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  }
};


// Configuration for radar charts (Peak Hours)
export const RADAR_CHART_CONFIG = {
  type: 'radar' as const,
  data: {
    labels: [] as string[],
    datasets: [] as any[]
  },
  options: {
    ...CHART_GLOBAL_CONFIG,
    elements: {
      line: {
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  }
};

// Interface for chart settings
export interface ChartSettings {
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
  responsive: boolean;
  theme: 'light' | 'dark';
  colorScheme: 'default' | 'colorblind' | 'monochrome';
}

// Function to apply settings to charts
export function applyChartSettings(chartConfig: any, settings: ChartSettings): any {
  const colors = settings.theme === 'dark' ? DARK_CHART_COLORS : CHART_COLORS;

  // Create a deep copy of the configuration
  const updatedConfig = JSON.parse(JSON.stringify(chartConfig));

  // Appliquer les paramètres de base
  updatedConfig.options.responsive = settings.responsive;
  updatedConfig.options.animation = settings.animation;

  // Appliquer la légende
  if (updatedConfig.options.plugins?.legend) {
    updatedConfig.options.plugins.legend.display = settings.showLegend;
    updatedConfig.options.plugins.legend.labels.color = settings.theme === 'dark' ? '#fff' : '#666';
  }

  // Appliquer la grille (scales)
  if (updatedConfig.options.scales) {
    Object.keys(updatedConfig.options.scales).forEach(scaleKey => {
      const scale = updatedConfig.options.scales[scaleKey];
      if (scale.grid) {
        scale.grid.display = settings.showGrid;
        scale.grid.color = settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      }
      if (scale.ticks) {
        scale.ticks.color = settings.theme === 'dark' ? '#fff' : '#666';
      }
    });
  }

  // Appliquer le thème aux couleurs
  if (updatedConfig.data?.datasets) {
    updatedConfig.data.datasets.forEach((dataset: any, index: number) => {
      if (settings.colorScheme === 'monochrome') {
        const baseColor = colors.primary;
        // Pour les graphiques circulaires, utiliser des variations de couleurs
        if (updatedConfig.type === 'pie' || updatedConfig.type === 'doughnut') {
          const colorScheme = getColorScheme(settings);
          dataset.backgroundColor = colorScheme;
          dataset.borderColor = colorScheme.map(color => adjustBrightness(color, 0.8)); // Bordures plus sombres
        } else {
          // Pour les autres graphiques, utiliser la couleur principale
          dataset.backgroundColor = baseColor;
          dataset.borderColor = baseColor;
        }
      } else if (settings.colorScheme === 'colorblind') {
        // Couleurs adaptées aux daltoniens
        const colorblindColors = ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7'];
        dataset.backgroundColor = colorblindColors[index % colorblindColors.length];
        dataset.borderColor = colorblindColors[index % colorblindColors.length];
      } else {
        // Couleurs par défaut
        if (dataset.type === 'line' || dataset.type === 'radar') {
          dataset.borderColor = colors.gradient[index % colors.gradient.length];
          dataset.backgroundColor = colors.gradient[index % colors.gradient.length];
        } else {
          dataset.backgroundColor = colors.gradient[index % colors.gradient.length];
          dataset.borderColor = colors.gradient[index % colors.gradient.length];
        }
      }
    });
  }

  // Appliquer le thème au tooltip
  if (updatedConfig.options.plugins?.tooltip) {
    updatedConfig.options.plugins.tooltip.backgroundColor = settings.theme === 'dark'
      ? 'rgba(0, 0, 0, 0.9)'
      : 'rgba(0, 0, 0, 0.8)';
    updatedConfig.options.plugins.tooltip.borderColor = colors.primary;
  }

  return updatedConfig;
}

// Fonction pour obtenir les couleurs selon le schéma
export function getColorScheme(settings: ChartSettings): string[] {
  const colors = settings.theme === 'dark' ? DARK_CHART_COLORS : CHART_COLORS;

  switch (settings.colorScheme) {
    case 'monochrome':
      // Créer des variations de la couleur principale pour distinguer les sections
      const baseColor = colors.primary;
      return [
        baseColor,
        adjustBrightness(baseColor, 0.8), // Plus sombre
        adjustBrightness(baseColor, 1.2), // Plus clair
        adjustBrightness(baseColor, 0.6), // Encore plus sombre
        adjustBrightness(baseColor, 1.4), // Encore plus clair
        adjustBrightness(baseColor, 0.4), // Très sombre
        adjustBrightness(baseColor, 1.6), // Très clair
        adjustBrightness(baseColor, 0.2)  // Presque noir
      ];
    case 'colorblind':
      return ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7'];
    default:
      return colors.gradient;
  }
}

// Fonction utilitaire pour ajuster la luminosité d'une couleur
function adjustBrightness(color: string, factor: number): string {
  // Convertir la couleur hex en RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Ajuster la luminosité
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

  // Convertir en hex
  return '#' +
    newR.toString(16).padStart(2, '0') +
    newG.toString(16).padStart(2, '0') +
    newB.toString(16).padStart(2, '0');
}
