import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface AllergenInfo {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}

export interface IngredientWithAllergen {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  allergen: string;
}

@Injectable({
  providedIn: 'root'
})
export class AllergenService {
  private baseUrl = 'http://localhost:5201/api/ingredients';

  // Mapping des allergènes avec leurs informations (EN)
  private readonly ALLERGEN_MAPPING: { [key: string]: AllergenInfo } = {
    'gluten': {
      name: 'gluten',
      displayName: 'Gluten',
      icon: '🌾',
      description: 'Contains gluten'
    },
    'crustaceans': {
      name: 'crustaceans',
      displayName: 'Crustaceans',
      icon: '🦐',
      description: 'Contains crustaceans'
    },
    'eggs': {
      name: 'eggs',
      displayName: 'Eggs',
      icon: '🥚',
      description: 'Contains eggs'
    },
    'fish': {
      name: 'fish',
      displayName: 'Fish',
      icon: '🐟',
      description: 'Contains fish'
    },
    'peanuts': {
      name: 'peanuts',
      displayName: 'Peanuts',
      icon: '🥜',
      description: 'Contains peanuts'
    },
    'soybeans': {
      name: 'soybeans',
      displayName: 'Soybeans',
      icon: '🫘',
      description: 'Contains soy'
    },
    'milk': {
      name: 'milk',
      displayName: 'Milk',
      icon: '🥛',
      description: 'Contains milk'
    },
    'nuts': {
      name: 'nuts',
      displayName: 'Tree nuts',
      icon: '🌰',
      description: 'Contains tree nuts'
    },
    'celery': {
      name: 'celery',
      displayName: 'Celery',
      icon: '🥬',
      description: 'Contains celery'
    },
    'mustard': {
      name: 'mustard',
      displayName: 'Mustard',
      icon: '🌶️',
      description: 'Contains mustard'
    },
    'sesame': {
      name: 'sesame',
      displayName: 'Sesame',
      icon: '⚪',
      description: 'Contains sesame'
    },
    'sulphites': {
      name: 'sulphites',
      displayName: 'Sulphites',
      icon: '🧪',
      description: 'Contains sulphites'
    },
    'lupin': {
      name: 'lupin',
      displayName: 'Lupin',
      icon: '🌱',
      description: 'Contains lupin'
    },
    'molluscs': {
      name: 'molluscs',
      displayName: 'Molluscs',
      icon: '🐚',
      description: 'Contains molluscs'
    }
  };

  constructor(private http: HttpClient) { }

  // Récupérer tous les ingrédients avec leurs allergènes
  getAllIngredientsWithAllergens(): Observable<IngredientWithAllergen[]> {
    return this.http.get<any>(`${this.baseUrl}/getAllIngredients`).pipe(
      map(response => response.ingredients || [])
    );
  }

  // Récupérer uniquement les allergènes disponibles
  getAvailableAllergens(): Observable<AllergenInfo[]> {
    // Retourner tous les allergènes valides du backend (sauf "none")
    const allAllergens = [
      'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts',
      'soybeans', 'milk', 'nuts', 'celery', 'mustard', 'sesame',
      'sulphites', 'lupin', 'molluscs'
    ];

    // Convertir en objets AllergenInfo
    const allergenInfos = allAllergens
      .map(allergen => this.ALLERGEN_MAPPING[allergen])
      .filter(allergen => allergen) // Filtrer les allergènes non reconnus
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return new Observable(observer => {
      observer.next(allergenInfos);
      observer.complete();
    });
  }

  // Récupérer les allergènes actuellement utilisés dans les ingrédients
  getUsedAllergens(): Observable<AllergenInfo[]> {
    return this.getAllIngredientsWithAllergens().pipe(
      map(ingredients => {
        const allergenSet = new Set<string>();
        
        // Collecter tous les allergènes uniques (sauf "none")
        ingredients.forEach(ingredient => {
          if (ingredient.allergen && ingredient.allergen !== 'none') {
            allergenSet.add(ingredient.allergen);
          }
        });

        // Convertir en objets AllergenInfo
        return Array.from(allergenSet)
          .map(allergen => this.ALLERGEN_MAPPING[allergen])
          .filter(allergen => allergen) // Filtrer les allergènes non reconnus
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
      })
    );
  }

  // Obtenir les informations d'un allergène spécifique
  getAllergenInfo(allergenName: string): AllergenInfo | null {
    return this.ALLERGEN_MAPPING[allergenName] || null;
  }

  // Vérifier si un ingrédient contient un allergène spécifique
  hasAllergen(ingredient: IngredientWithAllergen, allergenName: string): boolean {
    return ingredient.allergen === allergenName;
  }

  // Vérifier si un mocktail contient un allergène spécifique
  mocktailContainsAllergen(mocktailIngredients: any[], allergenName: string): boolean {
    return mocktailIngredients.some(ingredient => 
      ingredient.allergen === allergenName
    );
  }
}
