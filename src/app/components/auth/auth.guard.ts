import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { isExpired } from '../../core/jwt.util';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getAccessToken();

  // Validar si el token existe y no está expirado
  if (!token || isExpired(token)) {
    router.navigate(['/login']);
    return false;
  }

    // 🎯 2. Obtener roles permitidos (asegura que no sea undefined)
    const allowedRoles: string[] = route?.data?.['roles'] ?? [];

    // 👤 3. Obtener roles del usuario
    const userRoles = authService.getUserRoles();
  
    console.log('Roles usuario:', userRoles);
    console.log('Roles permitidos:', allowedRoles);

  // 🚫 4. Si hay restricción de roles, validar acceso
  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));
    if (!hasAccess) {
      console.warn('Acceso denegado. Redirigiendo a /403');
      router.navigate(['/dashboard']); // o dashboard si prefieres
      return false;
    }
  }

  return true;
};
