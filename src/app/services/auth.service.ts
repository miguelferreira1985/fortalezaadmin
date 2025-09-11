import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/auth/login';
  
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    const loginPayload = { username, password};
    return this.http.post<any>(`${this.apiUrl}${this.apiPath}`, loginPayload);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public isAuthenticated(): boolean {
    return this.getAccessToken() != null;
  }

  public logout(): void {
    // 1. Remove the token from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 2. Navigate the user back to the login page
    this.router.navigate(['/login']);
  }
  
  
}
