import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mocktail {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export interface Ingredient {
  id: number;
  name: string;
  stock: number;
  limit: number;
  unit: string;
}

export interface CreateMocktailRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export interface UpdateMocktailRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class MocktailService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Mocktail[]> {
    return this.http.get<Mocktail[]>(`http://localhost:5201/api/MocktailQuery/getAllMocktails`);
  }

  getById(id: number): Observable<Mocktail> {
    return this.http.get<Mocktail>(`${this.apiUrl}/${id}`);
  }

  create(mocktail: CreateMocktailRequest): Observable<Mocktail> {
    return this.http.post<Mocktail>(`http://localhost:5201/api/MocktailCommand/CreateMocktail`, mocktail);
  }


  update(id: number, mocktail: UpdateMocktailRequest): Observable<Mocktail> {
    return this.http.put<Mocktail>(`${this.apiUrl}/${id}`, mocktail);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Nouvelle méthode pour récupérer tous les ingrédients
  getAllIngredients(): Observable<Ingredient[]> {
    return this.http.get<{ ingredients: Ingredient[] }>(`${environment.apiUrl.replace('/mocktail', '')}/ingredients/getAllIngredients`)
      .pipe(
        map(response => response.ingredients)
      );
  }

}
