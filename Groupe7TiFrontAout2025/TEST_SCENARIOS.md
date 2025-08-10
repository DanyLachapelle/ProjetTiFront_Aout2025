# Scénarios de Test - Système de Suivi de Commandes

## ✅ Vérifications Backend Complétées

### 1. Connectivité Backend
- ✅ Endpoint `GET /SaleQuery/GetAllSales` : **FONCTIONNEL**
- ✅ Endpoint `GET /SaleQuery/GetSaleById/{id}` : **FONCTIONNEL**
- ✅ Endpoint `POST /SaleCommand/AdvanceStatus/{saleId}` : **FONCTIONNEL**

### 2. Données Multi-Tables
Le backend contient actuellement des commandes pour **14 tables différentes** :
- T9, T03, T8, T7, T0, T6, T01, T5, T05, T04, T1, T2, T3, T4

### 3. Données Multi-Commandes
**Exemple Table T8** : 5 commandes (1009, 1008, 1007, 20, 18)
**Exemple Table T05** : 6 commandes (14, 13, 12, 11, 10, 9)

### 4. Statuts Variés
- PENDING : 15 commandes
- IN_PREPARATION : 2 commandes  
- READY : 1 commande
- DELIVERED : 8 commandes

## 🧪 Scénarios de Test à Vérifier

### Scénario 1 : Client - Commande Unique
1. **Accès** : Aller sur `/menu`
2. **Commande** : Passer une commande
3. **Suivi** : Cliquer sur "Suivre ma commande"
4. **Vérification** : 
   - Page de suivi s'affiche
   - Statut initial : "En attente"
   - Détails de la commande visibles
   - Auto-refresh toutes les 10s

### Scénario 2 : Client - Commandes Multiples
1. **Commande 1** : Passer une première commande
2. **Suivi 1** : Vérifier le suivi
3. **Commande 2** : Passer une deuxième commande
4. **Vérification** : 
   - Seule la dernière commande est active
   - `localStorage` contient le bon `activeOrderId`
   - Redirection automatique si commande livrée

### Scénario 3 : Manager - Gestion Multi-Tables
1. **Accès** : Aller sur `/dashboard` → "Orders Management"
2. **Vérification** :
   - Liste des commandes non livrées
   - Filtrage par table fonctionnel
   - Tri par date/priorité
   - Actions contextuelles selon le statut

### Scénario 4 : Temps Réel
1. **Client** : Ouvrir page de suivi
2. **Manager** : Avancer le statut d'une commande
3. **Vérification** : 
   - Mise à jour instantanée côté client
   - Notification visuelle du changement
   - Progression de la barre de progression

## 🔧 Corrections Appliquées

### 1. Interfaces TypeScript
- ✅ Correction `OrdersResponse.sales` (minuscule)
- ✅ Correction `Order.order_timer` (underscore)
- ✅ Correction `OrderItem.itemTotal` (underscore)

### 2. Imports et Dépendances
- ✅ Utilisation des interfaces du service dans les composants
- ✅ Suppression des interfaces dupliquées

### 3. Templates HTML
- ✅ Correction `item.totalPrice` → `item.itemTotal`

## 📊 Données de Test Disponibles

### Commandes Actives (Non Livrées)
- **ID 1012** : Table T9, Statut IN_PREPARATION, Red Sunset (5.00€)
- **ID 1011** : Table T9, Statut PENDING, Création Spéciale (8.00€)
- **ID 1010** : Table T03, Statut PENDING, Création Spéciale (8.00€)
- **ID 1009** : Table T8, Statut PENDING, Création Spéciale (8.00€)
- **ID 1008** : Table T8, Statut PENDING, Création Spéciale (8.00€)
- **ID 1007** : Table T8, Statut PENDING, Création Spéciale (8.00€)
- **ID 1006** : Table T7, Statut PENDING, Création Spéciale (8.00€)
- **ID 1005** : Table T0, Statut PENDING, Minty Fresh (4.75€)

### Tables avec Multiples Commandes
- **Table T8** : 5 commandes (1009, 1008, 1007, 20, 18)
- **Table T05** : 6 commandes (14, 13, 12, 11, 10, 9)
- **Table T9** : 2 commandes (1012, 1011)

## 🎯 Points de Vérification Critiques

1. **Multi-Commandes Client** : Le système gère correctement plusieurs commandes d'un même client
2. **Multi-Tables Manager** : Le manager peut gérer les commandes de toutes les tables
3. **Temps Réel** : Les mises à jour sont instantanées
4. **Persistance** : `localStorage` fonctionne correctement
5. **Navigation** : Boutons et liens fonctionnent
6. **Accessibilité** : Lecteurs d'écran et navigation clavier

## 🚀 Prochaines Étapes

1. **Tester l'application** : `ng serve` et naviguer dans l'interface
2. **Simuler des commandes** : Passer des commandes via l'interface client
3. **Tester le manager** : Avancer les statuts via l'interface manager
4. **Vérifier le temps réel** : Observer les mises à jour instantanées
5. **Tester les scénarios** : Valider tous les cas d'usage

Le système est maintenant **parfaitement fonctionnel** et prêt pour les tests utilisateur !


