import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../models/subcategory';
import { SubcategoryRequestDto } from '../models/subcategory-request-dto';

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

  createSubcategory(subcategoryRequestDto: SubcategoryRequestDto): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}${this.apiPath}`, subcategoryRequestDto);
  }

  updateSubcategory(id: number, subcategoryRequestDto: SubcategoryRequestDto): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}${this.apiPath}/${id}`, subcategoryRequestDto);
  }
  
}
