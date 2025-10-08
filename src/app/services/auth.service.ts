import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { AuthTokens } from '../models/auth-tokens';
import { ApiResponse } from '../models/api-response';
import { map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  role: string[];
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`
  
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<AuthTokens> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((res) => res.data),
        tap((tokens) => this.storeTokens(tokens))
      );
  }

  refresh(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        map((res) => res.data),
        tap((tokens) => this.storeTokens(tokens)),
        map((tokens) => tokens.token)
      );
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() != null;
  }

  getUserRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];

    try {
      const decode = jwtDecode<JwtPayload>(token);
      return decode.role || [];
    } catch (e) {
      console.error('Error decoding JWT', e);
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  public logout(): void {
    // 1. Remove the token from local storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    // 2. Navigate the user back to the login page
    this.router.navigate(['/login']);
  }

  private storeTokens(tokens: AuthTokens): void {
    sessionStorage.setItem('accessToken', tokens.token);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
  }
  
  
}
