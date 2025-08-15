# 📊 Graphiques - HELHA Fresh

## 📦 Librairies
```json
{
  "chart.js": "^4.4.0",
  "ng2-charts": "^8.0.0"
}
```

## 📈 Graphiques Implémentés

### **Gestion des Ventes** (`/gestion-sales`)
- **Tendances** - Ligne (ventes par période)
- **Top Mocktails** - Barres (plus commandés)
- **Distribution** - Secteurs (répartition)
- **Heures de Pointe** - Radar (ventes par heure)
- **Comparaison** - Barres (entre périodes)

## 🔧 Implémentation

### **Import**
```typescript
import { Chart } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
Chart.register();
```

### **Template**
```html
<canvas baseChart
  [data]="chartData"
  [options]="chartOptions"
  [type]="'line'">
</canvas>
```

### **Services**
- **ChartDataService** - Préparation des données
- **ChartExportService** - Export PNG/ZIP

## 🎨 Configuration
- **Couleurs** : Palette HELHA Fresh
- **Thèmes** : Mode clair/sombre
- **Responsive** : Adaptation mobile/desktop
