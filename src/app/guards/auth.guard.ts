import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.roles().length === 0) {
    auth.logout();
    return router.createUrlTree(['/login'], { queryParams: { error: 'sin-rol' } });
  }
  return true;
};
