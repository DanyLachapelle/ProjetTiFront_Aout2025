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

  private static FORGOT_PASSWORD_URL: string = 'http://localhost:5201/api/users/forgot-password';

  private static RESET_PASSWORD_URL: string = 'http://localhost:5201/api/users/reset-password';

  constructor(private _http:HttpClient) { }

  login(loginData: { pseudo: string; password: string }): Observable<any> {
    return this._http.post<any>(
      UserService.LOGIN_URL,
      loginData
    );
  }


  changePassword(changeData: { oldPassword: string, newPassword: string }): Observable<any> {
    return this._http.post<any>(
      UserService.CHANGE_PASSWORD_URL,
      changeData
    );
  }

  static isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  forgotPassword(forgotData : {email: string}) {
    return this._http.post<any>(
      UserService.FORGOT_PASSWORD_URL,
      forgotData
    );
  }

  resetPassword(resetData : {token: string, newPassword: string}) {
    return this._http.post<any>(
      UserService.RESET_PASSWORD_URL,
      resetData
    );
  }
}
