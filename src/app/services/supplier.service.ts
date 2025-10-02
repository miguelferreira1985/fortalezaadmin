import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Supplier } from '../models/supplier';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private apiUrl = environment.apiUrl;
  private apiPath = "/suppliers";

  constructor(private http: HttpClient) {}

  getSuppliers(isActivate?: boolean): Observable<Supplier[]> {
    let params = new HttpParams();
    if (isActivate !== undefined) {
      params = params.set('isActivate', isActivate.toString());
    }
    return this.http
      .get<ApiResponse<Supplier[]>>(`${this.apiUrl}${this.apiPath}`, { params })
      .pipe(map(res => res.data));
  }

  createSupplier(supplier: Supplier): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${this.apiUrl}${this.apiPath}`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.apiUrl}${this.apiPath}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}${this.apiPath}/${id}`);
  }
  
}
