import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TableDto {
  tableNumber: string;
  displayName: string;
  isAvailable: boolean;
}

export interface GetAllTablesResponse {
  tables: TableDto[];
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private baseUrl = 'http://localhost:5201/api/SaleQuery';

  constructor(private http: HttpClient) { }

  getAllTables(): Observable<GetAllTablesResponse> {
    return this.http.get<GetAllTablesResponse>(`${this.baseUrl}/GetAllTables`);
  }
}
