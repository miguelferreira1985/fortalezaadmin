import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environment/environment';

const LOGIN_URL = `${environment.apiUrl}/auth/login`;


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const isLoginRequest = req.url.includes('/auth/login');

  if (isLoginRequest) {
    console.log('entre al interceptor')
    return next(req);
  }

  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (!isLoginRequest && accessToken) {
    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return next(authReq);
  }
  return next(req);
};
