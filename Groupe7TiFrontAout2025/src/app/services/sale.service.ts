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



  createSale(data: { tableNumber: string; items?: any[] }) {
    return this._http.post<any>('http://localhost:5201/api/SaleCommand/CreateSale', data);
  }

  addItemToSale(payload: { saleId: number; mocktailId: number; quantity: number }) {
    return this._http.post('http://localhost:5201/api/SaleItemCommand/AddSaleItem', payload);
  }

  getAllSales(): Observable<any> {
    console.log('🌐 Appel getAllSales vers:', `${this.baseUrl}/SaleQuery/GetAllSales`);
    return this._http.get<any>(`${this.baseUrl}/SaleQuery/GetAllSales`);
  }

}
