import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user';
import { ApiResponse } from '../models/api-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangePasswordRequestDto } from '../models/change-password-request-dto';
import { UpdateRolesRequestDto } from '../models/update-roles-request-dt0';

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

  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}${this.apiPath}/${id}/activate`, null);
  }

  desactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}${this.apiPath}/${id}/deactivate`, null);
  }

  unblockUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}${this.apiPath}/${id}/unblock`, null);
  }

  changePassword(id: number, changePasswordRequestDto: ChangePasswordRequestDto): Observable<User> {
    console.log('request de servicio', changePasswordRequestDto);
    return this.http.patch<User>(`${this.apiUrl}${this.apiPath}/${id}/password`, changePasswordRequestDto);
  }

  updateRoles(id: number, updateRolesRequestDto: UpdateRolesRequestDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}${this.apiPath}/${id}/roles`, updateRolesRequestDto);
  }
  
}
