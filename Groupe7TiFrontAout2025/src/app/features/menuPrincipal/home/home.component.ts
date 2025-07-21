import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { QrService } from '../../../services/qr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  /** 5 minutes en secondes */
  timeLeft = 300;
  /** Token courant utilisé dans l’URL du QR code */
  qrToken = '';
  /** URL du QR code à afficher */
  qrCodeUrl = '';
  /** Pixel transparent utilisé côté serveur pour éviter un décalage d’hydratation */
  readonly placeholderPixel =
    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  private timerSubscription?: Subscription;

  constructor(
    private qrService: QrService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  /** Initialisation uniquement côté navigateur */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.generateNewQRCode();
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  /**
   * Génère un nouveau token + URL et remet le timer à 5 minutes
   */
  private generateNewQRCode(): void {
    const tokenData = this.qrService.generateToken();
    this.qrToken = tokenData.token;
    this.qrCodeUrl = this.generateQRCodeUrl(tokenData.token);
    this.timeLeft = 300;
  }

  /**
   * Construit l’URL du QR code.
   * En SSR, `window` n’existe pas ; on renvoie une chaîne vide pour éviter l’erreur.
   */
  private generateQRCodeUrl(token: string): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    const menuUrl = `${window.location.origin}/menu?token=${token}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
  }

  /** Lance le compte à rebours local */
  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.generateNewQRCode();
      }
    });
  }

  /** Affiche le temps restant au format MM:SS */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onAccessMenu(): void {
    this.router.navigate(['/menu'], { queryParams: { token: this.qrToken } });
  }

  onAccessAdmin(): void {
    this.router.navigate(['/admin/login']);
  }

  onRefreshQR(): void {
    this.generateNewQRCode();
  }
}
