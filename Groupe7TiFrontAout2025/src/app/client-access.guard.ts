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

  // Token valide ?
  if (!tokenData || qrService.isTokenExpired(tokenData) || !tokenData.isValid) {
    router.navigate(['/']);
    return false;
  }

  // Récupération étape
  const currentStep = qrService.getStep();

  // Vérification en fonction de la page demandée
  const routePath = route.routeConfig?.path;

  if (routePath === 'geoloc' && currentStep < ClientStep.START) {
    router.navigate(['/']);
    return false;
  }

  if (routePath === 'table' && currentStep < ClientStep.GEOLOC) {
    router.navigate(['/geoloc']);
    return false;
  }

  if (routePath === 'menu' && currentStep < ClientStep.TABLE) {
    router.navigate(['/table']);
    return false;
  }

  return true;
};
