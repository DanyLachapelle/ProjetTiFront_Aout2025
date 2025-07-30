import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Sale} from '../features/manager/gestion-sales/chart-data.service';



export interface SaleItem {
  id: number;
  mocktailId: number;
  mocktailName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}


@Injectable({
  providedIn: 'root'
})
export class SaleService {
    private baseUrl = 'http://localhost:5201/api';

    constructor(private _http: HttpClient) { }

    createSale(): Observable<{ id: number }> {
    return this._http.post<{ id: number }>('http://localhost:5201/api/SaleCommand/CreateSale', {
      tableNumber: "1"
    });
  }


  addItemToSale(payload: { saleId: number; mocktailId: number; quantity: number }) {
    return this._http.post('http://localhost:5201/api/SaleItemCommand/AddSaleItem', payload);
  }

  getAllSales(): Observable<{ sales: Sale[] }> {
    return this._http.get<{ sales: Sale[] }>(`${this.baseUrl}/SaleQuery/GetAllSales`);
  }

}
