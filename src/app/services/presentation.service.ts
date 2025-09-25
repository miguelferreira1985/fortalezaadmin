import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Presentation } from '../models/presentation';

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  private apiUrl = environment.apiUrl;
  private apiPath = '/presentations';

  constructor(private http: HttpClient) {}

  getAllPresentations(): Observable<Presentation[]> {
    return this.http.get<Presentation[]>(`${this.apiUrl}${this.apiPath}`);
  }

  createPresentation(presentation: Presentation): Observable<Presentation> {
    return this.http.post<Presentation>(`${this.apiUrl}${this.apiPath}`, presentation);
  }

  updatePresentation(id: number, presentation: Presentation): Observable<Presentation> {
    return this.http.put<Presentation>(`${this.apiUrl}${this.apiPath}/${id}`, presentation);
  }
  
}
