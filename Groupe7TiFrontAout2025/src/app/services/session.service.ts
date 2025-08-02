import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { Router } from '@angular/router';

export interface SessionData {
  tableNumber: string;
  startTime: Date;
  remainingTime: number; // en secondes
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionData = new BehaviorSubject<SessionData | null>(null);
  private sessionTimer: any;
  private readonly SESSION_DURATION = 15 * 60; // 15 minutes en secondes

  constructor(private router: Router) {
    this.loadSessionFromStorage();
  }

  // Initialiser une nouvelle session
  startSession(tableNumber: string): void {
    const sessionData: SessionData = {
      tableNumber,
      startTime: new Date(),
      remainingTime: this.SESSION_DURATION
    };

    this.sessionData.next(sessionData);
    this.saveSessionToStorage(sessionData);
    this.startTimer();
  }

  // Obtenir les données de session
  getSessionData(): Observable<SessionData | null> {
    return this.sessionData.asObservable();
  }

  // Obtenir le numéro de table actuel
  getCurrentTableNumber(): string | null {
    return this.sessionData.value?.tableNumber || null;
  }

  // Obtenir le temps restant
  getRemainingTime(): number {
    return this.sessionData.value?.remainingTime || 0;
  }

  // Vérifier si la session est active
  isSessionActive(): boolean {
    return this.sessionData.value !== null && this.getRemainingTime() > 0;
  }

  // Formater le temps restant en MM:SS
  formatRemainingTime(): string {
    const time = this.getRemainingTime();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Arrêter la session
  endSession(): void {
    this.sessionData.next(null);
    this.clearSessionFromStorage();
    this.stopTimer();
    this.router.navigate(['/']);
  }

  // Démarrer le timer
  private startTimer(): void {
    this.stopTimer(); // Arrêter le timer précédent s'il existe
    
    console.log('Session service timer disabled - using component timer instead');
    
    // Désactiver le timer du service pour éviter le double décompte
    // Le composant gère maintenant le timer directement
  }

  // Arrêter le timer
  private stopTimer(): void {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = null;
    }
  }

  // Sauvegarder la session dans le localStorage
  private saveSessionToStorage(sessionData: SessionData): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('helha-fresh-session', JSON.stringify(sessionData));
    }
  }

  // Charger la session depuis le localStorage
  private loadSessionFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSession = localStorage.getItem('helha-fresh-session');
      if (savedSession) {
        try {
          const sessionData: SessionData = JSON.parse(savedSession);
          
          // Calculer le temps écoulé depuis le début de la session
          const now = new Date();
          const startTime = new Date(sessionData.startTime);
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const remainingTime = Math.max(0, this.SESSION_DURATION - elapsedSeconds);
          
          // Vérifier si la session n'est pas expirée
          if (remainingTime > 0) {
            const updatedSessionData = { ...sessionData, remainingTime };
            this.sessionData.next(updatedSessionData);
            this.saveSessionToStorage(updatedSessionData);
            this.startTimer();
          } else {
            this.clearSessionFromStorage();
          }
        } catch (error) {
          console.error('Error loading session from localStorage:', error);
          this.clearSessionFromStorage();
        }
      }
    }
  }

  // Effacer la session du localStorage
  private clearSessionFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('helha-fresh-session');
    }
  }
} 