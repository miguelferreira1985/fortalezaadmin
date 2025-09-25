import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { param } from 'jquery';
import { ProductRequestDto } from '../models/product-request-dto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/products';

  constructor(private http: HttpClient) {}

    getProducts(isActivate?: boolean): Observable<Product[]> {
      let params = new HttpParams();
      if (isActivate !== undefined) {
        params = params.set('isActivate', isActivate.toString());
      }
      return this.http.get<Product[]>(`${this.apiUrl}${this.apiPath}`, { params });
    }

    getInventoryValue(): Observable<number> {
      return this.http.get<number>(`${this.apiUrl}${this.apiPath}/inventory-value`);
    }

    getLowStock(): Observable<Product[]> {
      return this.http.get<Product[]>(`${this.apiUrl}${this.apiPath}/low-stock`);
    }

    createProduct(productRequestDto: ProductRequestDto): Observable<Product> {
      return this.http.post<Product>(`${this.apiUrl}${this.apiPath}`, productRequestDto);
    }

    updateProduct(id: number, productRequestDto: ProductRequestDto): Observable<Product> {
      return this.http.put<Product>(`${this.apiUrl}${this.apiPath}/${id}`, productRequestDto);
    }

    activateProduct(id: number): Observable<Product> {
      return this.http.patch<Product>(`${this.apiUrl}${this.apiPath}/${id}/activate`, null);
    }

    desactivateProduct(id: number): Observable<Product> {
      return this.http.patch<Product>(`${this.apiUrl}${this.apiPath}/${id}/desactivate`, null);
    }

    deleteProduct(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}${this.apiPath}/${id}`);
    }
  
}
