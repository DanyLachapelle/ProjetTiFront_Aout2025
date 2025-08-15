import {ClientStep, QrService} from './services/qr.service';
import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';

export const clientAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const qrService = inject(QrService);
  const router = inject(Router);

  const tokenFromStorage = localStorage.getItem('qrToken');
  let tokenData = tokenFromStorage ? JSON.parse(tokenFromStorage) : null;

  if (!tokenData) {
    const tokenFromUrl = route.queryParamMap.get('token');
    if (tokenFromUrl) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
      tokenData = { token: tokenFromUrl, expiresAt, isValid: true, createdAt: now };
      qrService['currentTokenSubject'].next(tokenData);
      qrService.saveTokenToLocal();
    }
  }

  if (!tokenData || qrService.isTokenExpired(tokenData) || !tokenData.isValid) {
    router.navigate(['/']);
    return false;
  }

  const currentStep = qrService.getStep();


  const routePath = route.routeConfig?.path;

  // GELOCL : interdit si trop tôt ou déjà passé à TABLE ou MENU
  if (routePath === 'geoloc') {
    if (currentStep < ClientStep.START) {
      router.navigate(['/']);
      return false;
    }
    if (currentStep >= ClientStep.GEOLOC) { // table ou menu
      router.navigate([currentStep >= ClientStep.MENU ? '/menu' : '/table']);
      return false;
    }
  }

  // TABLE : interdit si étape précédente pas faite, ou déjà au MENU
  if (routePath === 'table') {
    if (currentStep < ClientStep.GEOLOC) {
      router.navigate(['/geoloc']);
      return false;
    }
    if (currentStep >= ClientStep.MENU) {
      router.navigate(['/menu']);
      return false;
    }
  }

  // MENU : interdit si étape précédente pas faite
  if (routePath === 'menu') {
    if (currentStep < ClientStep.TABLE) {
      router.navigate(['/table']);
      return false;
    }
  }

  return true;
};
