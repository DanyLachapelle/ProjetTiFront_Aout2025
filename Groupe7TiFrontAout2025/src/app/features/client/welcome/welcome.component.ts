// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
//
// @Component({
//   selector: 'app-welcome',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './welcome.component.html',
//   styleUrl: './welcome.component.css'
// })
// export class WelcomeComponent {
//   currentStep = 1; // 1: Welcome, 2: Location, 3: Table Number
//   location = '';
//   tableNumber = 'T';
//   isLoading = false;
//
//   constructor(private router: Router) {}
//
//   // Méthode pour gérer la saisie automatique
//   onTableNumberInput(event: any) {
//     let value = event.target.value;
//
//     // S'assurer que ça commence toujours par "T"
//     if (!value.startsWith('T')) {
//       value = 'T' + value.replace(/^T/i, '');
//     }
//
//     // Supprimer tous les caractères non numériques après le T
//     const numericPart = value.substring(1).replace(/\D/g, '');
//
//     // Limiter à 2 chiffres maximum
//     if (numericPart.length > 2) {
//       value = 'T' + numericPart.substring(0, 2);
//     } else {
//       value = 'T' + numericPart;
//     }
//
//     this.tableNumber = value;
//   }
//
//   // Méthode pour gérer les touches spéciales
//   onTableNumberKeydown(event: any) {
//     // Permettre: backspace, delete, tab, escape, enter, et les chiffres
//     if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
//         // Permettre Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
//         (event.keyCode === 65 && event.ctrlKey === true) ||
//         (event.keyCode === 67 && event.ctrlKey === true) ||
//         (event.keyCode === 86 && event.ctrlKey === true) ||
//         (event.keyCode === 88 && event.ctrlKey === true) ||
//         // Permettre les chiffres (0-9)
//         (event.keyCode >= 48 && event.keyCode <= 57) ||
//         (event.keyCode >= 96 && event.keyCode <= 105)) {
//       return;
//     }
//
//     // Empêcher toutes les autres touches
//     event.preventDefault();
//   }
//
//   // Méthode pour gérer le focus
//   onTableNumberFocus(event: any) {
//     // Sélectionner automatiquement la partie numérique
//     const input = event.target;
//     if (input.value.length > 1) {
//       input.setSelectionRange(1, input.value.length);
//     }
//   }
//
//   // Étape 1: Vérification de la localisation
//   checkLocation() {
//     this.isLoading = true;
//
//     // Simulation de la vérification de localisation
//     setTimeout(() => {
//       this.isLoading = false;
//       this.currentStep = 2;
//     }, 2000);
//   }
//
//   // Étape 2: Saisie du numéro de table
//   setTableNumber() {
//     if (this.tableNumber.trim() && this.tableNumber.length >= 2) {
//       // Sauvegarder le numéro de table
//       localStorage.setItem('helha-fresh-table', this.tableNumber);
//       this.currentStep = 3;
//     }
//   }
//
//   // Étape 3: Accéder au menu
//   goToMenu() {
//     this.router.navigate(['/menu']);
//   }
//
//   // Retour à l'étape précédente
//   goBack() {
//     if (this.currentStep > 1) {
//       this.currentStep--;
//     }
//   }
//
//   // Réinitialiser
//   reset() {
//     this.currentStep = 1;
//     this.location = '';
//     this.tableNumber = 'T';
//     localStorage.removeItem('helha-fresh-table');
//   }
// }
