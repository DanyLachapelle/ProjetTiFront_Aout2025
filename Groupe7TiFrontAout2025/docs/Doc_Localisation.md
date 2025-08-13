# 🌍 Géolocalisation - HELHA Fresh

## ⚙️ Configuration

### **Zone de Couverture**
```typescript
// src/app/config/location.config.ts
export const ESTABLISHMENT_CONFIG = {
  latitude: 50.4542,  // Mons, Belgique
  longitude: 3.9522,  // Mons, Belgique
  radius: 150000,     // 150km (toute la Belgique pour tests)
  name: "HELHA Fresh"
};
```

### **Options**
```typescript
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,        // 10 secondes
  maximumAge: 60000      // Cache 1 minute
};
```

## 🔧 Fonctionnement

### **Service**
```typescript
// src/app/services/geolocation.service.ts
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  verifyLocation(): Observable<LocationResult>
  private calculateDistance(): number  // Formule de Haversine
}
```

### **Interface**
```typescript
export interface LocationResult {
  isWithinEstablishment: boolean;
  distance: number;
  userPosition: { latitude: number; longitude: number; };
  establishmentPosition: { latitude: number; longitude: number; };
}
```

## 🔄 Flux Client

1. **Welcome** (`/welcome`) - Accueil
2. **Géoloc** (`/geoloc`) - Vérification position
3. **Table** (`/table`) - Numéro de table
4. **Session** (`/session`) - Compte à rebours 15min
5. **Menu** (`/menu`) - Interface commande

## 🧪 Mode Démo

- **Zone** : Toute la Belgique acceptée
- **Messages** : Simule vérification établissement
- **Affichage** : Coordonnées GPS pour présentation
- **Redirection** : Auto après 3 secondes

## 🛠️ Production

Pour un vrai établissement :
```typescript
radius: 100,  // 100m autour de l'établissement
```
