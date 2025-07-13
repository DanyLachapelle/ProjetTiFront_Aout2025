import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';


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

}
