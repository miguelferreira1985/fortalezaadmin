import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier';

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
    return this.http.get<Supplier[]>(`${this.apiUrl}${this.apiPath}`, { params });
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}${this.apiPath}`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}${this.apiPath}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${this.apiPath}/${id}`);
  }
  
}
