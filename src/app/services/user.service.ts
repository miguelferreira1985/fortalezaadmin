import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user';
import { ApiResponse } from '../models/api-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/users';

  constructor(private http: HttpClient) {}

  getUsers(isActivate?: boolean): Observable<User[]> {
    let params = new HttpParams();
    if (isActivate !== undefined) {
      params = params.set('isActivate', isActivate.toString());
    }
    return this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}${this.apiPath}`, { params })
      .pipe(map(res => res.data));
  }
  
}
