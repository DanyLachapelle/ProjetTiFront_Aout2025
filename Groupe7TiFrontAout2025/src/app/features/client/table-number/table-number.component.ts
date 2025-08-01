import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../services/session.service';
import { OrderTrackingService } from '../../../services/order-tracking.service';

@Component({
  selector: 'app-table-number',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './table-number.component.html',
  styleUrl: './table-number.component.css'
})
export class TableNumberComponent {
  tableNumber = '';
  error: string | null = null;
  loading = false;

  constructor(
    private router: Router, 
    private sessionService: SessionService,
    private orderTrackingService: OrderTrackingService
  ) {}

  validateAndContinue() {
    this.error = null;
    const regex = /^T\d{1,2}$/i;
    if (!regex.test(this.tableNumber.trim())) {
      this.error = "Please enter a valid table number (e.g., T01, T10).";
      return;
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const newTableNumber = this.tableNumber.trim();
      const newTableNum = parseInt(newTableNumber.replace('T', ''));
      
      // Récupérer l'ancien numéro de table
      const oldTableNumber = localStorage.getItem('table_number');
      const oldTableNum = oldTableNumber ? parseInt(oldTableNumber.replace('T', '')) : null;
      
      // Nettoyer les données de l'ancienne table si différente
      if (oldTableNum && oldTableNum !== newTableNum) {
        console.log(`Changement de table: ${oldTableNum} → ${newTableNum}`);
        this.orderTrackingService.clearTableData(oldTableNum);
      }
      
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
