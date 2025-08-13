import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {UserService} from './features/manager/login-page/user.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(UserService);
  const router = inject(Router);

  if (!UserService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }


  return true;
};
