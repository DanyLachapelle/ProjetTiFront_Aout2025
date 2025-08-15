import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapContainer class="map" style="height: 300px; width: 100%; border-radius: 12px;"></div>
    </div>
  `,
  styles: [`
    .map-container {
      margin: 1rem 0;
    }
    
    .map {
      border: 2px solid rgba(34, 197, 94, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    :host ::ng-deep .leaflet-control-attribution {
      font-size: 10px;
    }
  `]
})
export class LocationMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() userLatitude: number = 0;
  @Input() userLongitude: number = 0;
  @Input() establishmentLatitude: number = 50.4542; // Mons
  @Input() establishmentLongitude: number = 3.9522; // Mons

  private map!: L.Map;
  private userMarker!: L.Marker;
  private establishmentMarker!: L.Marker;

  ngOnInit() {
    // Import Leaflet CSS
    this.loadLeafletCSS();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadLeafletCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  private initMap() {
    // Attendre que le CSS soit chargé
    setTimeout(() => {
      // Créer la carte centrée sur Mons
      this.map = L.map(this.mapContainer.nativeElement).setView([50.4542, 3.9522], 8);

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      // Ajouter le marqueur de l'établissement (vert)
      this.establishmentMarker = L.marker([this.establishmentLatitude, this.establishmentLongitude], {
        icon: L.divIcon({
          className: 'establishment-marker',
          html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map);

      // Ajouter le marqueur de l'utilisateur (rouge)
      if (this.userLatitude && this.userLongitude) {
        this.userMarker = L.marker([this.userLatitude, this.userLongitude], {
          icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(this.map);

        // Ajouter des popups
        this.establishmentMarker.bindPopup('<b>🏪 Our Establishment</b><br>Mons, Belgique');
        this.userMarker.bindPopup('<b>📍 Your Location</b><br>Position détectée');

        // Ajuster la vue pour voir les deux marqueurs
        const bounds = L.latLngBounds([
          [this.userLatitude, this.userLongitude],
          [this.establishmentLatitude, this.establishmentLongitude]
        ]);
        this.map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Si pas de position utilisateur, juste centrer sur l'établissement
        this.establishmentMarker.bindPopup('<b>🏪 Our Establishment</b><br>Mons, Belgique');
      }

      // Forcer le rafraîchissement de la carte
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }, 200);
  }

  // Méthode pour mettre à jour la position utilisateur
  updateUserPosition(lat: number, lng: number) {
    this.userLatitude = lat;
    this.userLongitude = lng;

    if (this.map && this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
      
      // Ajuster la vue
      const bounds = L.latLngBounds([
        [lat, lng],
        [this.establishmentLatitude, this.establishmentLongitude]
      ]);
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }
}
