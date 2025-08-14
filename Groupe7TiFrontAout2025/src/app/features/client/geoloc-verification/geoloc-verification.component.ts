import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeolocationService, LocationResult } from '../../../services/geolocation.service';
import { LocationMapComponent } from '../../../components/location-map/location-map.component';
import {ClientStep, QrService} from '../../../services/qr.service';

@Component({
  selector: 'app-geoloc-verification',
  standalone: true,
  imports: [CommonModule, LocationMapComponent],
  templateUrl: './geoloc-verification.component.html',
  styleUrl: './geoloc-verification.component.css'
})
export class GeolocVerificationComponent {
  error: string | null = null;
  loading = false;
  locationResult: LocationResult | null = null;

  constructor(
    private router: Router,
    private geolocationService: GeolocationService,
    private route: ActivatedRoute,
    private qrService: QrService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      // Création d’un QRToken
      const qrToken = {
        token,
        expiresAt,
        isValid: true,
        createdAt: now,
      };

      this.qrService['currentTokenSubject'].next(qrToken);
      this.qrService.saveTokenToLocal();
    }
  }

  requestGeolocation() {
    this.error = null;
    this.loading = true;
    this.locationResult = null;

    this.geolocationService.verifyLocation().subscribe({
      next: (result) => {
        this.locationResult = result;

        if (result.isWithinEstablishment) {
          console.log('✅ Utilisateur dans l\'établissement - Accès accordé');
          this.loading = false;
        } else {
          console.log('❌ Utilisateur hors de l\'établissement');
          this.error = `You are too far from our establishment (${this.geolocationService.formatDistance(result.distance)} away). Please come to our establishment to access our services.`;
          this.loading = false;
        }
      },
      error: (errorMessage) => {
        console.error('❌ Erreur géolocalisation:', errorMessage);
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  proceedToMenu() {
    console.log('🍹 Redirection vers le menu');
    this.qrService.setStep(ClientStep.GEOLOC);
    this.router.navigate(['/table']);
  }

  getFormattedDistance(): string {
    if (!this.locationResult) return '';
    return this.geolocationService.formatDistance(this.locationResult.distance);
  }

  getFormattedCoordinates(): string {
    if (!this.locationResult) return '';
    return this.geolocationService.formatCoordinates(
      this.locationResult.userPosition.latitude,
      this.locationResult.userPosition.longitude
    );
  }

  getAccuracyInfo(): string {
    if (!this.locationResult?.demoInfo?.accuracy) return '';
    return `±${Math.round(this.locationResult.demoInfo.accuracy)}m`;
  }
}
