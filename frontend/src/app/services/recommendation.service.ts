import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recommendation } from '../models/recommendation.models';
import { PageableResponse } from '../models/carbon.models';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRecommendations(page: number = 0, size: number = 10): Observable<PageableResponse<Recommendation>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageableResponse<Recommendation>>(`${this.apiUrl}/api/recommendations`, { params });
  }

  generate(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/recommendations/generate`, {});
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/recommendations/${id}/read`, {});
  }
}
