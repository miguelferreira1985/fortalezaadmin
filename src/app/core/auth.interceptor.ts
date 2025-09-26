import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environment/environment';
import { catchError, switchMap, throwError } from 'rxjs';

const LOGIN_URL = `${environment.apiUrl}/auth/login`;


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && auth.getRefreshToken()) {
        return auth.refresh().pipe(
          switchMap((newToken) => {
            const retried = req.clone({
              setHeaders: { Auhtorization: `Bearer ${newToken}` }
            });
            return next(retried);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
