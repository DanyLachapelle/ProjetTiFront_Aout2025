# 🌍 Configuration du Système de Géolocalisation - Établissement

## 📋 Vue d'ensemble

Le système de géolocalisation **affiche** qu'il vérifie que les utilisateurs sont physiquement dans l'établissement, mais **en réalité** il accepte toute la Belgique pour les tests et présentations. Il utilise l'API de géolocalisation du navigateur et calcule la distance entre la position de l'utilisateur et le centre de la Belgique.

## ⚙️ Configuration Actuelle

### **Zone de couverture : Toute la Belgique (pour les tests)**

```typescript
export const ESTABLISHMENT_CONFIG: EstablishmentLocation = {
  latitude: 50.8503,  // Centre de la Belgique (Bruxelles)
  longitude: 4.3517,  // Centre de la Belgique (Bruxelles)
  radius: 150000,     // Rayon de 150km pour couvrir toute la Belgique (pour les tests)
  name: "HELHA Fresh",
  address: "Our establishment"
};
```

### **Messages affichés : Vérification d'établissement**

L'interface affiche des messages comme si on vérifiait la présence dans l'établissement :
- "Verify you are in our establishment"
- "We need to verify that you are within our establishment for security reasons"
- "Establishment Access Verified"
- "You're in our establishment!"

### **Fonctionnalités de démonstration**

Le système inclut des fonctionnalités de démonstration pour les présentations :

- **Affichage des coordonnées GPS** : Position exacte de l'utilisateur
- **Calcul de distance** : Distance depuis le centre de la Belgique
- **Précision GPS** : Indication de la précision du signal
- **Statut d'accès** : Confirmation visuelle de l'autorisation
- **Délai de redirection** : 3 secondes pour voir les informations

## 🔧 Fonctionnement Technique

### **Architecture du système**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Component     │───▶│ GeolocationService│───▶│ Location Config │
│ (UI Interface)  │    │ (Business Logic) │    │ (Belgium Zone)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Router        │    │ Browser API      │
│ (Navigation)    │    │ (navigator.geo)  │
└─────────────────┘    └──────────────────┘
```

### **Processus de vérification**

1. **Demande d'autorisation** : Le navigateur demande l'autorisation de géolocalisation
2. **Récupération GPS** : Obtention des coordonnées de l'utilisateur
3. **Calcul de distance** : Distance depuis le centre de la Belgique (Bruxelles)
4. **Vérification** : Comparaison avec le rayon de 150km
5. **Affichage démo** : Informations de position pour la présentation
6. **Redirection** : Accès accordé après 3 secondes

### **Formule de calcul de distance**

```typescript
// Formule de Haversine pour calculer la distance depuis Bruxelles
const R = 6371e3; // Rayon de la Terre en mètres
const φ1 = lat1 * Math.PI / 180;
const φ2 = lat2 * Math.PI / 180;
const Δφ = (lat2 - lat1) * Math.PI / 180;
const Δλ = (lon2 - lon1) * Math.PI / 180;

const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

return R * c; // Distance en mètres
```

## 🧪 Tests et Débogage

### **Console de développement**

Ouvrez la console du navigateur (F12) pour voir les logs :

```
📍 Vérification géolocalisation: {
  userPosition: { latitude: 50.8503, longitude: 4.3517 },
  establishmentPosition: { latitude: 50.8503, longitude: 4.3517 },
  distance: "0km",
  isWithinEstablishment: true,
  demoInfo: { accuracy: 10, timestamp: "2024-01-01T12:00:00.000Z" }
}
```

### **Affichage de démonstration**

Après autorisation, l'interface affiche :

```
🎯 Establishment Access Verified
├── Your Position: 50.850300, 4.351700
├── Distance from Establishment: 0.0km
├── GPS Accuracy: ±10m
└── Access Status: ✅ Access Granted - You're in our establishment!

⏱️ Redirecting to menu in 3 seconds...
```

### **Test en développement**

Pour tester depuis l'étranger :

1. **Modifiez temporairement les coordonnées** dans `location.config.ts`
2. **Utilisez les coordonnées de votre position actuelle**
3. **Testez la fonctionnalité**
4. **Remettez les coordonnées de Bruxelles** avant la production

## 🚨 Gestion des Erreurs

### **Types d'erreurs gérées**

| Code | Erreur | Description |
|------|--------|-------------|
| 1 | `PERMISSION_DENIED` | Utilisateur a refusé l'autorisation |
| 2 | `POSITION_UNAVAILABLE` | Position GPS indisponible |
| 3 | `TIMEOUT` | Délai d'attente dépassé |

### **Messages d'erreur personnalisés**

```typescript
export const GEOLOCATION_MESSAGES = {
  TOO_FAR: (distance: number) => `You are too far from our establishment (${Math.round(distance/1000)}km away). Please come to our establishment to access our services.`,
  // ...
};
```

## 🔒 Sécurité et Confidentialité

### **Données collectées**
- **Coordonnées GPS** : Latitude et longitude uniquement
- **Pas de stockage** : Les coordonnées ne sont pas sauvegardées
- **Vérification locale** : Calcul de distance côté client

### **Conformité RGPD**
- **Consentement explicite** : L'utilisateur doit autoriser la géolocalisation
- **Finalité limitée** : Vérification de présence en Belgique uniquement
- **Pas de traçage** : Aucun historique de position

## 📱 Compatibilité

### **Navigateurs supportés**
- ✅ Chrome 50+
- ✅ Firefox 55+
- ✅ Safari 10+
- ✅ Edge 12+
- ❌ Internet Explorer (non supporté)

### **Appareils supportés**
- ✅ Ordinateurs avec GPS/WiFi
- ✅ Smartphones (iOS/Android)
- ✅ Tablettes
- ⚠️ Ordinateurs sans GPS (précision réduite)

## 🎯 Cas d'usage

### **Scénarios typiques**

1. **Présentation** : Démonstration de la géolocalisation en temps réel
2. **Test de compatibilité** : Vérification du fonctionnement GPS
3. **Formation** : Explication du processus de géolocalisation
4. **Développement** : Tests depuis toute la Belgique

### **Exemples de distances**

```typescript
// Bruxelles (centre)
distance: "0.0km"

// Anvers
distance: "45.2km"

// Gand
distance: "55.8km"

// Liège
distance: "95.3km"

// Charleroi
distance: "50.1km"
```

## 🔄 Maintenance

### **Vérifications régulières**
- ✅ Tester la précision GPS dans différentes villes belges
- ✅ Vérifier la couverture complète du territoire
- ✅ Surveiller les erreurs en production
- ✅ Tester les fonctionnalités de démonstration

### **Modification de la zone**

Si vous souhaitez changer la zone de couverture :

1. **Modifier les coordonnées** dans `location.config.ts`
2. **Ajuster le rayon** selon vos besoins
3. **Tester la nouvelle configuration**
4. **Mettre à jour la documentation**

## 🎨 Personnalisation de l'affichage

### **Configuration de démonstration**

```typescript
export const DEMO_CONFIG = {
  showLocationInfo: true, // Afficher les informations de position
  showDistance: true,     // Afficher la distance calculée
  showCoordinates: true   // Afficher les coordonnées GPS
};
```

### **Styles personnalisables**

Les couleurs et styles peuvent être modifiés dans le CSS :
- **Vert** : Succès et autorisation
- **Bleu** : Informations de redirection
- **Rouge** : Erreurs et refus

## 🔄 Passage en production

### **Pour un vrai établissement**

Pour passer en production avec un vrai établissement :

1. **Modifier les coordonnées** : Remplacer par les vraies coordonnées de l'établissement
2. **Réduire le rayon** : Passer de 150km à 50-100m selon la taille de l'établissement
3. **Tester la précision** : Vérifier que seuls les clients dans l'établissement sont acceptés
4. **Ajuster les messages** : Personnaliser les textes selon vos besoins

### **Exemple de configuration production**

```typescript
export const ESTABLISHMENT_CONFIG: EstablishmentLocation = {
  latitude: 50.8503,  // Coordonnées réelles de l'établissement
  longitude: 4.3517,  // Coordonnées réelles de l'établissement
  radius: 100,        // 100m autour de l'établissement
  name: "HELHA Fresh",
  address: "Rue de l'établissement, Ville, Pays"
};
```

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur
2. Testez avec différentes positions en Belgique
3. Consultez la documentation de l'API Geolocation
4. Contactez l'équipe de développement

## 🇧🇪 Couverture de la Belgique

Le système couvre actuellement toute la Belgique avec un rayon de 150km depuis Bruxelles, incluant :
- **Région flamande** : Anvers, Gand, Bruges, etc.
- **Région wallonne** : Liège, Charleroi, Namur, etc.
- **Région de Bruxelles-Capitale** : Toutes les communes
- **Communauté germanophone** : Eupen, Saint-Vith, etc.

## 🎭 Mode Démonstration

**Important** : Le système fonctionne actuellement en mode démonstration :
- **Interface** : Affiche "vérification d'établissement"
- **Réalité** : Accepte toute la Belgique
- **Objectif** : Permettre les tests et présentations
- **Production** : Nécessite une configuration spécifique à l'établissement
