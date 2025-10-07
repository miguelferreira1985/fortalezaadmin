import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isExpired } from '../../core/jwt.util';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  if (token && !isExpired(token)) {
    return true;
  } 

  router.navigate(['/login']);
  return false;
};
