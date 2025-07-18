import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static URL: string = 'http://localhost:5201/api/users/';

  private static LOGIN_URL: string = 'http://localhost:5201/api/users/login';

  private static CHANGE_PASSWORD_URL: string = 'http://localhost:5201/api/users/change-password';

  constructor(private _http:HttpClient) { }

  login(loginData: { pseudo: string; password: string }): Observable<any> {
    return this._http.post<any>(
      UserService.LOGIN_URL,
      loginData // ⬅️ Ajoute ça aussi
    );
  }


  changePassword(changeData: { oldPassword: string, newPassword: string }): Observable<any> {
    console.log('Change Password payload:', JSON.stringify(changeData, null, 2));
    return this._http.post<any>(
      UserService.CHANGE_PASSWORD_URL,
      changeData// ⬅️ Ajoute ça
    );
  }

}
