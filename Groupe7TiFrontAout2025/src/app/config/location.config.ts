/**
 * Configuration de géolocalisation pour l'établissement
 * 
 * Configuration pour accepter toute la Belgique (pour les tests)
 * mais afficher des messages comme si on vérifiait la présence dans l'établissement
 */

export interface EstablishmentLocation {
  latitude: number;
  longitude: number;
  radius: number; // Rayon en mètres
  name: string;
  address: string;
}

export const ESTABLISHMENT_CONFIG: EstablishmentLocation = {
  latitude: 50.4542,  // Mons, Belgique
  longitude: 3.9522,  // Mons, Belgique
  radius: 150000,     // Rayon de 150km pour couvrir toute la Belgique (pour les tests)
  name: "HELHA Fresh",
  address: "Our establishment in Mons"
};

/**
 * Options de géolocalisation pour le navigateur
 */
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Utilise le GPS si disponible
  timeout: 10000, // Timeout de 10 secondes
  maximumAge: 60000 // Cache la position pendant 1 minute
};

/**
 * Messages d'erreur personnalisés
 */
export const GEOLOCATION_MESSAGES = {
  PERMISSION_DENIED: "Location access was denied. Please enable location services in your browser settings to continue.",
  POSITION_UNAVAILABLE: "Location information is unavailable. Please check your GPS signal and try again.",
  TIMEOUT: "Location request timed out. Please try again.",
  NOT_SUPPORTED: "Geolocation is not supported by this browser.",
  TOO_FAR: (distance: number) => `You are too far from our establishment (${Math.round(distance/1000)}km away). Please come to our establishment to access our services.`,
  UNKNOWN_ERROR: "An unknown error occurred while getting your location. Please try again."
};

/**
 * Configuration pour l'affichage de démonstration
 */
export const DEMO_CONFIG = {
  showLocationInfo: true, // Afficher les informations de position pour les présentations
  showDistance: true,     // Afficher la distance calculée
  showCoordinates: true   // Afficher les coordonnées GPS
};
