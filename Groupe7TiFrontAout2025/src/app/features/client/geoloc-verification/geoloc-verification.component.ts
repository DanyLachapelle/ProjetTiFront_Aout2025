import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-geoloc-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geoloc-verification.component.html',
  styleUrl: './geoloc-verification.component.css'
})
export class GeolocVerificationComponent {
  error: string | null = null;
  loading = false;

  constructor(private router: Router) {}

  requestGeolocation() {
    this.error = null;
    this.loading = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Ici tu peux vérifier la position si besoin
          this.router.navigate(['/table']);
        },
        (err) => {
          this.error = "La géolocalisation est requise pour continuer.";
          this.loading = false;
        }
      );
    } else {
      this.error = "La géolocalisation n'est pas supportée par ce navigateur.";
      this.loading = false;
    }
  }
}
