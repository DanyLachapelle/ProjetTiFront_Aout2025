import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../services/session.service';


@Component({
  selector: 'app-table-number',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './table-number.component.html',
  styleUrl: './table-number.component.css'
})
export class TableNumberComponent {
  tableNumber = 'T';
  error: string | null = null;
  loading = false;

  constructor(
    private router: Router, 
    private sessionService: SessionService,

  ) {}

  // Méthode pour gérer la saisie automatique
  onTableNumberInput(event: any) {
    let value = event.target.value;
    
    // S'assurer que ça commence toujours par "T"
    if (!value.startsWith('T')) {
      value = 'T' + value.replace(/^T/i, '');
    }
    
    // Supprimer tous les caractères non numériques après le T
    const numericPart = value.substring(1).replace(/\D/g, '');
    
    // Limiter à 2 chiffres maximum
    if (numericPart.length > 2) {
      value = 'T' + numericPart.substring(0, 2);
    } else {
      value = 'T' + numericPart;
    }
    
    this.tableNumber = value;
  }

  // Méthode pour gérer les touches spéciales
  onTableNumberKeydown(event: any) {
    // Permettre: backspace, delete, tab, escape, enter, et les chiffres
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Permettre Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Permettre les chiffres (0-9)
        (event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105)) {
      return;
    }
    
    // Empêcher toutes les autres touches
    event.preventDefault();
  }

  // Méthode pour gérer le focus
  onTableNumberFocus(event: any) {
    // Sélectionner automatiquement la partie numérique
    const input = event.target;
    if (input.value.length > 1) {
      input.setSelectionRange(1, input.value.length);
    }
  }

  validateAndContinue() {
    this.error = null;
    const regex = /^T\d{1,2}$/i;
    if (!regex.test(this.tableNumber.trim())) {
      this.error = "Veuillez entrer un numéro de table valide (ex: T01, T10).";
      return;
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const newTableNumber = this.tableNumber.trim();
      const newTableNum = parseInt(newTableNumber.replace('T', ''));
      
      // Récupérer l'ancien numéro de table
      const oldTableNumber = localStorage.getItem('table_number');
      const oldTableNum = oldTableNumber ? parseInt(oldTableNumber.replace('T', '')) : null;
      

      
      // Nettoyer les données globales non organisées
      localStorage.removeItem('current-order');
      localStorage.removeItem('current_order');
      localStorage.removeItem('helha-fresh-cart');
      localStorage.removeItem('mocktail_orders'); // Ancienne clé globale
      
      // Sauvegarder le nouveau numéro de table
      localStorage.setItem('table_number', newTableNumber);
      
      console.log('Numéro de table sauvegardé:', newTableNumber);
      
      // Démarrer la session avec le numéro de table
      this.sessionService.startSession(newTableNumber);
      this.router.navigate(['/menu']);
    }
  }
}
