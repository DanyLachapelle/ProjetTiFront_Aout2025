import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { QrService } from './services/qr.service';

export const clientAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const qrService = inject(QrService);
  const router = inject(Router);

  // 1️⃣ Vérifie si un token est déjà en local
  const tokenFromStorage = localStorage.getItem('qrToken');
  let tokenData = tokenFromStorage ? JSON.parse(tokenFromStorage) : null;

  // 2️⃣ Si pas en local, on regarde dans l’URL
  if (!tokenData) {
    const tokenFromUrl = route.queryParamMap.get('token');
    if (tokenFromUrl) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      tokenData = {
        token: tokenFromUrl,
        expiresAt,
        isValid: true,
        createdAt: now
      };

      qrService['currentTokenSubject'].next(tokenData);
      qrService.saveTokenToLocal();
    }
  }

  // 3️⃣ Vérifie si token valide
  if (tokenData && !qrService.isTokenExpired(tokenData) && tokenData.isValid) {
    return true; // ✅ accès autorisé
  }

  // ❌ Sinon, redirection
  router.navigate(['/']);
  return false;
};
