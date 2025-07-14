import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

export interface DeleteIngredientOutput {
  success: boolean;
  message: string;
}

export interface UpdateLimitIngredientOutput {
  success: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class IngredientService {
    private static URL: string = 'http://localhost:5201/api/ingredients/getAllIngredients';

    constructor(private _http: HttpClient) { }

    GetAll(): Observable<any> {
        return this._http.get<any>(IngredientService.URL);
    }

  CreateIngredient(ingredient: { name: string; quantity: number; restock_threshold: number; unit: string }): Observable<any> {
    return this._http.post<any>(
      'http://localhost:5201/api/ingredients/createIngredient',
      {
        name: ingredient.name,
        quantity: ingredient.quantity,
        restock_threshold: ingredient.restock_threshold,
        unit: ingredient.unit
      }
    );
    }

  deleteIngredient(id: number): Observable<DeleteIngredientOutput> {
    return this._http.delete<DeleteIngredientOutput>(`http://localhost:5201/api/ingredients/deleteIngredient/${id}`);
  }

  updateRestockThreshold(id: number, restockThreshold: number): Observable<{ success: boolean; message: string }> {
    return this._http.put<{ success: boolean; message: string }>(
      `http://localhost:5201/api/ingredients/updateLimitIngredient/${id}`,
      { restockThreshold }  // attention au nom de la propriété selon backend
    );
  }

  updateQuantity(id: number, amount: number): Observable<{ success: boolean; message: string }> {
    return this._http.put<{ success: boolean; message: string }>(
      `http://localhost:5201/api/ingredients/updateQuantity/${id}`,
      amount
    );
  }

}
