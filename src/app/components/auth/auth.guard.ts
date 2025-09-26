import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isExpired } from '../../core/jwt.util';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  console.log('Token from localStorage:', token);

  if (token && !isExpired(token)) {
    console.log('Token válido, acceso permitido ✅');
    return true;
  } 

  console.warn('Token inválido/expirado ❌, redirigiendo a login');
  router.navigate(['/login']);
  return false;
};
