import { Component, OnInit, OnDestroy, NgIterable, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MocktailService } from '../../../services/mocktail.service';
import { SaleService } from '../../../services/sale.service';
import { SessionService, SessionData } from '../../../services/session.service';
import { IngredientService } from '../../../services/ingredient.service';
import { AllergenService, AllergenInfo, IngredientWithAllergen } from '../../../services/allergen.service';
import {ClientStep, QrService} from '../../../services/qr.service';

interface Mocktail {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  forceAvailable: boolean | null;
  image: string;
  ingredients: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    allergen: string; // Champ allergène obligatoire
  }>;
}

interface Ingredient {
  stockStatus: string;
  id: number;
  name: string;
  quantity: number;
  allergen?: string; // Ajout du champ allergène
}

interface OrderItem {
  mocktail: Mocktail;
  quantity: number;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  // Mocktails data
  mocktails: Mocktail[] = []; // Remplace le tableau statique

  // Modal state
  showOrderModal = false;
  selectedMocktail: Mocktail | null = null;
  selectedQuantity = 1;
  orderList: OrderItem[] = [];
  isLoading = true;

  // Cart animation
  isAddingToCart = false;
  cartAnimation = false;
  availableIngredients: Ingredient[] = [];
  showSuccessNotification = false;

  // Browser back button confirmation
  showExitConfirmationModal = false;

  // Quantity limits
  readonly MAX_QUANTITY = 10;
  readonly MIN_QUANTITY = 1;

  // Session management
  sessionData: SessionData | null = null;
  remainingTime = '15:00';
  private timerInterval: any;
  private sessionTimeSeconds = 15 * 60; // 15 minutes en secondes

  // Browser back button detection
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    event.preventDefault();
    this.showExitConfirmationModal = true;
  }

  // Timer formatting
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  constructor(
    private mocktailService: MocktailService,
    private router: Router,
    private sessionService: SessionService,
    private saleService: SaleService,
    private ingredientService: IngredientService,
    private allergenService: AllergenService,
    private qrService: QrService,
  ) {
    // Push a state to enable back button detection
    history.pushState(null, '', location.href);
  }

  ngOnInit() {
    this.loadSessionData();
    this.loadMocktails();
    this.loadAvailableIngredients();
    this.startSimpleTimer();
    this.qrService.setStep(ClientStep.MENU);
  }

  loadSessionData() {
    this.sessionService.getSessionData().subscribe({
      next: (sessionData) => {
        this.sessionData = sessionData;
        if (!sessionData) {
          this.router.navigate(['/']);
          return;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la session:', error);
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    //localStorage.clear();
  }

  loadAvailableIngredients() {
    this.ingredientService.GetAll().subscribe({
      next: (response: { ingredients: Ingredient[] }) => {
        this.availableIngredients = response.ingredients;
      },
      error: (error) => {
        console.error('Erreur récupération ingrédients:', error);
      }
    });
  }

  private startSimpleTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.sessionTimeSeconds > 0) {
        this.sessionTimeSeconds--;
        this.remainingTime = this.formatTime(this.sessionTimeSeconds);
      } else {
        clearInterval(this.timerInterval);
        this.sessionService.endSession();
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  // Méthodes pour la session
  getTableNumber(): string {
    // Récupérer le numéro de table depuis localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const tableNumber = localStorage.getItem('table_number');
      return tableNumber || 'T01';
    }
    return 'T01';
  }

  getFormattedRemainingTime(): string {
    return this.sessionService.formatRemainingTime();
  }

  loadMocktails() {
    this.isLoading = true;

    this.mocktailService.getAll().subscribe({
      next: (mocktails) => {
        // Utiliser directement les mocktails du backend avec leur statut de disponibilité calculé
        this.mocktails = mocktails;
        this.extractAllIngredients();


        this.filterMocktails();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement mocktails:', error);
        this.isLoading = false;
      }
    });
  }

  // Méthode utilitaire pour déterminer si un mocktail est réellement disponible
  isMocktailActuallyAvailable(mocktail: Mocktail): boolean {
    // Si force_available est false (forcé indisponible par le gérant), toujours indisponible
    if (mocktail.forceAvailable === false) {
      return false;
    }
    // Sinon, utiliser la disponibilité basée sur le stock des ingrédients
    return mocktail.available;
  }

  // --- Cart management ---
  openOrderModal(mocktail: Mocktail) {
    if (!this.isMocktailActuallyAvailable(mocktail)) return;

    this.selectedMocktail = mocktail;
    this.selectedQuantity = 1;
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedMocktail = null;
    this.selectedQuantity = 1;
  }

  addToOrder() {
    if (!this.selectedMocktail || this.selectedQuantity < this.MIN_QUANTITY) return;

    // Add to cart animation
    this.isAddingToCart = true;

    // Check if mocktail is already in the list
    const found = this.orderList.find(item => item.mocktail.id === this.selectedMocktail!.id);
    if (found) {
      found.quantity += this.selectedQuantity;
    } else {
      this.orderList.push({
        mocktail: this.selectedMocktail,
        quantity: this.selectedQuantity
      });
    }

    // Save to localStorage
    this.saveCartToStorage();

    // Animation delay
    setTimeout(() => {
      this.isAddingToCart = false;
      this.cartAnimation = true;
      setTimeout(() => {
        this.cartAnimation = false;
      }, 300);
    }, 500);

    this.closeOrderModal();
  }

  getOrderTotal(): number {
    return this.orderList.reduce((total, item) => total + (item.mocktail.price * item.quantity), 0);
  }

  clearOrder() {
    this.orderList = [];
    this.saveCartToStorage();
  }

  removeOrderItem(id: number) {
    this.orderList = this.orderList.filter(item => item.mocktail.id !== id);
    this.saveCartToStorage();
  }

  increaseQuantity(item: OrderItem) {
    if (item.quantity < this.MAX_QUANTITY) {
      item.quantity++;
      this.saveCartToStorage();
    }
  }

  decreaseQuantity(item: OrderItem) {
    if (item.quantity > this.MIN_QUANTITY) {
      item.quantity--;
      this.saveCartToStorage();
    }
  }

  showFullOrderModal = false;

  openFullOrderModal() {
    this.showFullOrderModal = true;
  }

  closeFullOrderModal() {
    this.showFullOrderModal = false;
  }

  onQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (value >= this.MIN_QUANTITY && value <= this.MAX_QUANTITY) {
      this.selectedQuantity = value;
    }
  }

  private saveCartToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('helha-fresh-cart', JSON.stringify(this.orderList));
    }
  }

  private loadCartFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('helha-fresh-cart');
      if (savedCart) {
        try {
          this.orderList = JSON.parse(savedCart);
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          this.orderList = [];
        }
      }
    }
  }

  getOrderItemCount(): number {
    return this.orderList.reduce((count, item) => count + item.quantity, 0);
  }

  isCartEmpty(): boolean {
    return this.orderList.length === 0;
  }

  onQuit() {
    if (confirm('Are you sure you want to leave? Your cart will be lost.')) {
      this.sessionService.endSession();
      this.router.navigate(['/']);
    }
  }

  onPay() {
    if (this.orderList.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const tableNumber = this.getTableNumber();

    // Préparer les données pour l'API
    const saleData = {
      tableNumber,
      items: this.orderList.map(item => ({
        mocktailId: item.mocktail.id,
        quantity: item.quantity,
        unitPrice: item.mocktail.price
      }))
    };



    this.saleService.createSale(saleData).subscribe({
      next: (response) => {


        // Store the active order ID for tracking
        if (response && response.id) {
          localStorage.setItem('activeOrderId', response.id.toString());

        }


        // --- Décrémenter les quantités d'ingrédients ---
        for (const orderItem of this.orderList) {
          const mocktail = orderItem.mocktail;

          for (const ingredient of mocktail.ingredients) {
            const quantityToDecrease = ingredient.quantity * orderItem.quantity;


            this.ingredientService.DecreaseQuantity(ingredient.id, quantityToDecrease)
              .subscribe({
                next: () => {

                },
                error: (error) => {
                  console.error(`Erreur lors de la décrémentation de ${ingredient.name}:`, error);
                }
              });
          }
        }
        // Clear the cart
        this.clearOrder();

        // Show success modal
        this.showSuccessNotification = true;

        // Close the order modal
        this.closeFullOrderModal();

        // Don't redirect automatically - wait for user to click OK
      },
      error: (error) => {
        console.error('❌ Error creating order:', error);
        alert('Error placing order. Please try again.');
      }
    });
  }

  // Méthodes pour le suivi de commande
  availableAllergens: AllergenInfo[] = [];
  usedAllergens: string[] = []; // Liste des allergènes actuellement utilisés
  excludedAllergens: string[] = [];

  filteredMocktails: Mocktail[] = [];
  expandedMocktailId: any;

  clearAllergenFilters() {
    this.excludedAllergens = [];
    this.filterMocktails();
  }

  isAllergenExcluded(allergenName: string): boolean {
    return this.excludedAllergens.includes(allergenName);
  }

  // Vérifier si un allergène est actuellement utilisé
  isAllergenUsed(allergenName: string): boolean {
    return this.usedAllergens.includes(allergenName);
  }

  // --- Allergen filtering ---
  toggleExcludedAllergen(allergenName: string) {
    const index = this.excludedAllergens.indexOf(allergenName);
    if (index > -1) {
      this.excludedAllergens.splice(index, 1);
    } else {
      this.excludedAllergens.push(allergenName);
    }
    this.filterMocktails();
  }

  private extractAllIngredients() {
    // Charger tous les allergènes disponibles
    this.allergenService.getAvailableAllergens().subscribe({
      next: (allergens) => {
        this.availableAllergens = allergens;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des allergènes:', error);
      }
    });

    // Charger les allergènes actuellement utilisés
    this.allergenService.getUsedAllergens().subscribe({
      next: (usedAllergens) => {
        this.usedAllergens = usedAllergens.map(a => a.name);

      },
      error: (error) => {
        console.error('Erreur lors du chargement des allergènes utilisés:', error);
      }
    });
  }

  // --- Ingredients display ---
  toggleIngredients(mocktailId: number) {
    this.expandedMocktailId = this.expandedMocktailId === mocktailId ? null : mocktailId;
  }

  // Méthodes d'aide pour les allergènes
  getAllergenIcon(allergenName: string): string {
    const allergenInfo = this.allergenService.getAllergenInfo(allergenName);
    return allergenInfo?.icon || '⚠️';
  }

  getAllergenDisplayName(allergenName: string): string {
    const allergenInfo = this.allergenService.getAllergenInfo(allergenName);
    return allergenInfo?.displayName || allergenName;
  }

  getAllergenDescription(allergenName: string): string {
    const allergenInfo = this.allergenService.getAllergenInfo(allergenName);
    return allergenInfo?.description || `Contains ${allergenName}`;
  }

  // Méthode pour obtenir le prix en toute sécurité
  getSelectedMocktailPrice(): string {
    return this.selectedMocktail?.price?.toFixed(2) || '0.00';
  }

  filterMocktails() {
    this.filteredMocktails = this.mocktails.filter(mocktail => {
      // Vérifier si le mocktail contient des allergènes exclus
      const hasExcludedAllergen = this.excludedAllergens.some(excludedAllergen => {
        return mocktail.ingredients.some(ingredient => {
          // Vérifier si l'ingrédient contient l'allergène exclu
          return ingredient.allergen === excludedAllergen;
        });
      });

      // On affiche aussi les mocktails non disponibles, mais ils restent désactivés dans le template
      return !hasExcludedAllergen;
    });
  }

  // --- Modal quantity controls ---
  decreaseModalQuantity() {
    if (this.selectedQuantity > this.MIN_QUANTITY) {
      this.selectedQuantity--;
    }
  }

  increaseModalQuantity() {
    if (this.selectedQuantity < this.MAX_QUANTITY) {
      this.selectedQuantity++;
    }
  }

  // Fonction utilitaire pour status stock
  getStockStatus(quantity: number, threshold: number): 'critical' | 'warning' | 'good' {
    if (quantity <= 0) return 'critical';
    if (quantity <= threshold) return 'warning';
    return 'good';
  }



  goToOrderTracking() {
    this.router.navigate(['/order-tracking']);
  }

  hasActiveOrder(): boolean {
    // Check if there's an active order ID in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const activeOrderId = localStorage.getItem('activeOrderId');
      return activeOrderId !== null && activeOrderId !== '';
    }
    return false;
  }

  closeSuccessNotification(): void {
    this.showSuccessNotification = false;
    // Redirect to order tracking after user clicks OK
    this.router.navigate(['/order-tracking']);
  }

  // Exit confirmation methods
  confirmExit() {
    this.showExitConfirmationModal = false;
    localStorage.removeItem('qrToken');
    localStorage.removeItem('helha-fresh-cart');
    localStorage.removeItem('table_number');
    localStorage.removeItem('clientStep');
    // Clear session and redirect to homepage
    this.sessionService.endSession();
  }

  cancelExit() {
    this.showExitConfirmationModal = false;
    // Push state again to prevent immediate back navigation
    history.pushState(null, '', location.href);
  }
}
