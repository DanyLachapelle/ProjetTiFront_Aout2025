# 🍹 HELHA Fresh - Système de Gestion de Bar à Mocktails

## 🚀 Démarrage Rapide

### **Backend (.NET)**
```bash
cd ProjetBack/Groupe7_Ti_Back_Aout2025/Groupe7_Ti_Back_Aout2025
dotnet run
```
- **URL** : `http://localhost:5000`
- **Swagger** : `http://localhost:5000/swagger`

### **Frontend (Angular)**
```bash
cd ProjetFront/Groupe7TiFrontAout2025
npm install
ng serve
```
- **URL** : `http://localhost:4200`
- **Manager** : `/dashboard`
- **Client** : `/welcome`

## 📦 Librairies Utilisées

### **Frontend (Angular 20)**
```json
{
  "@angular/core": "^20.1.2",
  "@angular/common": "^20.1.2",
  "@angular/router": "^20.1.2",
  "chart.js": "^4.4.0",
  "ng2-charts": "^8.0.0",
  "leaflet": "^1.9.4",
  "rxjs": "~7.8.0"
}
```

### **Backend (.NET)**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="AutoMapper" Version="12.0.0" />
```

## 👥 Composants Principaux

### **Manager Interface**
- **Dashboard** (`/dashboard`) - Vue d'ensemble avec statistiques
- **Gestion Mocktails** (`/gestion-mocktails`) - CRUD des recettes
- **Gestion Ingrédients** (`/gestion-ingredients`) - Gestion des stocks
- **Gestion Ventes** (`/gestion-sales`) - Historique avec graphiques
- **Gestion Commandes** (`/orders`) - Suivi temps réel

### **Client Interface**
- **Welcome** (`/welcome`) - Accueil et géolocalisation
- **Menu** (`/menu`) - Catalogue et commande
- **Suivi Commande** (`/order-tracking`) - Statut en temps réel

## 🔧 Fonctionnalités Clés

- ✅ **Géolocalisation** - Vérification présence (mode démo Belgique)
- ✅ **Graphiques** - Chart.js pour analyses ventes
- ✅ **Temps réel** - Suivi commandes et stock
- ✅ **Allergènes** - 14 types supportés
- ✅ **Sessions** - 15 min pour clients
- ✅ **JWT Auth** - Sécurité managers

## 🎯 Statuts Commande

1. **PENDING** → En attente
2. **IN_PREPARATION** → En préparation  
3. **READY** → Prêt
4. **DELIVERED** → Livré
