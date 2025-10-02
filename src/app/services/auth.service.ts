import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { AuthTokens } from '../models/auth-tokens';
import { ApiResponse } from '../models/api-response';
import { map, tap } from 'rxjs/operators';

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
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() != null;
  }

  public logout(): void {
    // 1. Remove the token from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 2. Navigate the user back to the login page
    this.router.navigate(['/login']);
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.token);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
  
  
}
