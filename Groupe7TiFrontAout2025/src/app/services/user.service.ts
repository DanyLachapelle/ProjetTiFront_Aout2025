import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static URL: string = 'http://localhost:5201/api/users/';

  private static LOGIN_URL: string = 'http://localhost:5201/api/users/login';

  constructor(private _http:HttpClient) { }

  login(loginData: { username: string; password: string }): Observable<any> {
    // Test credentials for development
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      return of({
        token: 'dev-token-12345',
        user: {
          id: 1,
          username: 'admin',
          role: 'manager'
        }
      });
    }
    
    // Try real backend
    return this._http.post<any>(UserService.LOGIN_URL, loginData);
  }

}
