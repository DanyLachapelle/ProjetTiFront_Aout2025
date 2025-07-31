import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  currentStep = 1; // 1: Welcome, 2: Location, 3: Table Number
  location = '';
  tableNumber = '';
  isLoading = false;

  constructor(private router: Router) {}

  // Étape 1: Vérification de la localisation
  checkLocation() {
    this.isLoading = true;
    
    // Simulation de la vérification de localisation
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 2;
    }, 2000);
  }

  // Étape 2: Saisie du numéro de table
  setTableNumber() {
    if (this.tableNumber.trim()) {
      // Sauvegarder le numéro de table
      localStorage.setItem('helha-fresh-table', this.tableNumber);
      this.currentStep = 3;
    }
  }

  // Étape 3: Accéder au menu
  goToMenu() {
    this.router.navigate(['/menu']);
  }

  // Retour à l'étape précédente
  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Réinitialiser
  reset() {
    this.currentStep = 1;
    this.location = '';
    this.tableNumber = '';
    localStorage.removeItem('helha-fresh-table');
  }
} 