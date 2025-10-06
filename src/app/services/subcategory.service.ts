import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subcategory } from '../models/subcategory';
import { SubcategoryRequestDto } from '../models/subcategory-request-dto';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/subcategories';

  constructor(private http: HttpClient) {}

  getSubcategories(): Observable<Subcategory[]> {
    return this.http
      .get<ApiResponse<Subcategory[]>>(`${this.apiUrl}${this.apiPath}`)
      .pipe(map(res => res.data));
  }

  createSubcategory(subcategoryRequestDto: SubcategoryRequestDto): Observable<ApiResponse<Subcategory>> {
    return this.http.post<ApiResponse<Subcategory>>(`${this.apiUrl}${this.apiPath}`, subcategoryRequestDto);
  }

  updateSubcategory(id: number, subcategoryRequestDto: SubcategoryRequestDto): Observable<ApiResponse<Subcategory>> {
    return this.http.put<ApiResponse<Subcategory>>(`${this.apiUrl}${this.apiPath}/${id}`, subcategoryRequestDto);
  }

  deleteSubcategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}${this.apiPath}/${id}`);
  }
  
}
