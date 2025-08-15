import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../services/session.service';
import { TableService, TableDto } from '../../../services/table.service';
import {ClientStep} from '../../../services/qr.service';
import {QrService} from '../../../services/qr.service';

@Component({
  selector: 'app-table-number',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './table-number.component.html',
  styleUrl: './table-number.component.css'
})
export class TableNumberComponent implements OnInit {
  selectedTableNumber = '';
  availableTables: TableDto[] = [];
  error: string | null = null;
  loading = false;
  isLoadingTables = true;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private tableService: TableService,
    private qrService: QrService
  ) {}

  ngOnInit() {
    this.loadAvailableTables();
  }

  loadAvailableTables() {
    this.isLoadingTables = true;
    this.error = null;

    this.tableService.getAllTables().subscribe({
      next: (response) => {
        // Trier les tables par numéro (du plus petit au plus grand)
        this.availableTables = response.tables.sort((a, b) => {
          const aNumber = this.extractTableNumber(a.tableNumber);
          const bNumber = this.extractTableNumber(b.tableNumber);
          return aNumber - bNumber;
        });

        this.isLoadingTables = false;

        // Sélectionner la première table par défaut
        if (this.availableTables.length > 0) {
          this.selectedTableNumber = this.availableTables[0].tableNumber;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tables:', error);
        this.error = 'Impossible de charger les tables disponibles.';
        this.isLoadingTables = false;

        // Fallback : créer des tables par défaut
        this.availableTables = this.generateDefaultTables();
        if (this.availableTables.length > 0) {
          this.selectedTableNumber = this.availableTables[0].tableNumber;
        }
      }
    });
  }

  private extractTableNumber(tableNumber: string): number {
    // Extraire le numéro après "T" et le convertir en entier
    if (tableNumber.startsWith('T')) {
      const numberPart = tableNumber.substring(1);
      const number = parseInt(numberPart, 10);
      return isNaN(number) ? Number.MAX_SAFE_INTEGER : number;
    }
    return Number.MAX_SAFE_INTEGER; // Placer les tables non numériques à la fin
  }

  private generateDefaultTables(): TableDto[] {
    // Générer les tables T01 à T20 par défaut
    const defaultTables: TableDto[] = [];
    for (let i = 1; i <= 20; i++) {
      defaultTables.push({
        tableNumber: `T${i.toString().padStart(2, '0')}`,
        displayName: `Table T${i.toString().padStart(2, '0')}`,
        isAvailable: true
      });
    }
    return defaultTables;
  }

  validateAndContinue() {
    this.error = null;

    if (!this.selectedTableNumber) {
      this.error = "Please select a table number.";
      return;
    }

    this.loading = true;

    if (typeof window !== 'undefined' && window.localStorage) {
      const newTableNumber = this.selectedTableNumber.trim();

      // Nettoyer les données globales non organisées
      localStorage.removeItem('current-order');
      localStorage.removeItem('current_order');
      localStorage.removeItem('helha-fresh-cart');
      localStorage.removeItem('mocktail_orders');

      // Sauvegarder le nouveau numéro de table
      localStorage.setItem('table_number', newTableNumber);


      // Démarrer la session avec le numéro de table
      this.sessionService.startSession(newTableNumber);
      this.qrService.setStep(ClientStep.TABLE);
      this.router.navigate(['/menu']);
    }
  }
}
