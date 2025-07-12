import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static URL: string = 'http://localhost:5201/api/users/';

  private static LOGIN_URL: string = 'http://localhost:5201/api/users/login';

  constructor(private _http:HttpClient) { }

  login(loginData: { login: string; mot_passe: string }): Observable<any> {
    return this._http.post<any>(UserService.LOGIN_URL, loginData);
  }
}
