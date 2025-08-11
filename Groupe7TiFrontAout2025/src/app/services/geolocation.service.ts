import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ESTABLISHMENT_CONFIG, GEOLOCATION_OPTIONS, GEOLOCATION_MESSAGES, DEMO_CONFIG } from '../config/location.config';

export interface LocationResult {
  isWithinEstablishment: boolean;
  distance: number;
  userPosition: {
    latitude: number;
    longitude: number;
  };
  establishmentPosition: {
    latitude: number;
    longitude: number;
  };
  // Informations de démonstration
  demoInfo?: {
    city?: string;
    region?: string;
    country?: string;
    accuracy?: number;
    timestamp: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  /**
   * Demande la géolocalisation et vérifie si l'utilisateur est dans l'établissement
   */
  verifyLocation(): Observable<LocationResult> {
    if (!navigator.geolocation) {
      return throwError(() => new Error(GEOLOCATION_MESSAGES.NOT_SUPPORTED));
    }

    return from(this.getCurrentPosition()).pipe(
      map(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const distance = this.calculateDistance(
          userLat, userLng,
          ESTABLISHMENT_CONFIG.latitude,
          ESTABLISHMENT_CONFIG.longitude
        );

        const isWithinEstablishment = distance <= ESTABLISHMENT_CONFIG.radius;

        // Informations de démonstration
        const demoInfo = DEMO_CONFIG.showLocationInfo ? {
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        } : undefined;

        console.log('📍 Vérification géolocalisation:', {
          userPosition: { latitude: userLat, longitude: userLng },
          establishmentPosition: { 
            latitude: ESTABLISHMENT_CONFIG.latitude, 
            longitude: ESTABLISHMENT_CONFIG.longitude 
          },
          distance: `${Math.round(distance/1000)}km`,
          isWithinEstablishment,
          demoInfo
        });

        return {
          isWithinEstablishment,
          distance,
          userPosition: { latitude: userLat, longitude: userLng },
          establishmentPosition: { 
            latitude: ESTABLISHMENT_CONFIG.latitude, 
            longitude: ESTABLISHMENT_CONFIG.longitude 
          },
          demoInfo
        };
      }),
      catchError(error => {
        console.error('❌ Erreur géolocalisation:', error);
        return throwError(() => this.handleGeolocationError(error));
      })
    );
  }

  /**
   * Obtient la position actuelle de l'utilisateur
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        GEOLOCATION_OPTIONS
      );
    });
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  }

  /**
   * Gère les erreurs de géolocalisation
   */
  private handleGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return GEOLOCATION_MESSAGES.PERMISSION_DENIED;
      case error.POSITION_UNAVAILABLE:
        return GEOLOCATION_MESSAGES.POSITION_UNAVAILABLE;
      case error.TIMEOUT:
        return GEOLOCATION_MESSAGES.TIMEOUT;
      default:
        return GEOLOCATION_MESSAGES.UNKNOWN_ERROR;
    }
  }

  /**
   * Vérifie si la géolocalisation est supportée par le navigateur
   */
  isGeolocationSupported(): boolean {
    return !!navigator.geolocation;
  }

  /**
   * Obtient la configuration de l'établissement
   */
  getEstablishmentConfig() {
    return ESTABLISHMENT_CONFIG;
  }

  /**
   * Formate la distance pour l'affichage
   */
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Formate les coordonnées pour l'affichage
   */
  formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}
