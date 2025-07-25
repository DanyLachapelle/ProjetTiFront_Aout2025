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
  tableNumber = '';
  error: string | null = null;
  loading = false;

  constructor(private router: Router, private sessionService: SessionService) {}

  validateAndContinue() {
    this.error = null;
    const regex = /^T\d{1,2}$/i;
    if (!regex.test(this.tableNumber.trim())) {
      this.error = "Please enter a valid table number (e.g., T01, T10).";
      return;
    }
    
    // Sauvegarder le numéro de table dans localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('table-number', this.tableNumber.trim());
    }
    
    // Démarrer la session avec le numéro de table
    this.sessionService.startSession(this.tableNumber.trim());
    this.router.navigate(['/menu']);
  }
}
