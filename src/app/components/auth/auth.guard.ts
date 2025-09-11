import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accessToken = localStorage.getItem('accessToken');

  console.log('Token from localStorage:', accessToken);

  if (accessToken) {
    console.log('Guard sent true');
    return true;
  } else {
    router.navigate(['/login']);
    console.log('Guard sent false');
    return false;
  }
};
