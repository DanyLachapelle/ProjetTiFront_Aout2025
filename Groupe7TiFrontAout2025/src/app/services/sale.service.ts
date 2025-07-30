import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class SaleService {


    constructor(private _http: HttpClient) { }

    createSale(): Observable<{ id: number }> {
    return this._http.post<{ id: number }>('http://localhost:5201/api/SaleCommand/CreateSale', {
      tableNumber: "1"
    });
  }


  addItemToSale(payload: { saleId: number; mocktailId: number; quantity: number }) {
    return this._http.post('http://localhost:5201/api/SaleItemCommand/AddSaleItem', payload);
  }


}
