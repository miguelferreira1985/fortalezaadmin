import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../models/subcategory';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/subcategories';

  constructor(private http: HttpClient) {}

  getSubcategories(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}${this.apiPath}`);
  }

  createSubcategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}${this.apiPath}`, subcategory);
  }

  updateCategory(id: number, subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}${this.apiPath}/${id}`, subcategory);
  }
  
}
