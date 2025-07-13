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
}
