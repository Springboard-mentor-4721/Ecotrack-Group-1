import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  Challenge, 
  ChallengeDetail, 
  ChallengeParticipant, 
  ChallengeRequest,
  ChallengeStats,
  ChallengeAnalytics
} from '../../../../models/challenge.models';
import { PageableResponse } from '../../../../models/carbon.models';
import { CarbonCategory } from '../../../../models/carbon-category.models';

@Injectable({
  providedIn: 'root'
})
export class AdminChallengeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/challenges`;

  getChallenges(
    page: number = 0, 
    size: number = 10,
    search?: string,
    status?: string,
    trackingMethod?: string
  ): Observable<PageableResponse<Challenge>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (trackingMethod) params = params.set('trackingMethod', trackingMethod);

    return this.http.get<PageableResponse<Challenge>>(this.apiUrl, { params });
  }

  getChallengeDetail(id: number): Observable<ChallengeDetail> {
    return this.http.get<ChallengeDetail>(`${this.apiUrl}/${id}`);
  }

  getChallengeStats(): Observable<ChallengeStats> {
    return this.http.get<ChallengeStats>(`${this.apiUrl}/stats`);
  }

  getChallengeAnalytics(): Observable<ChallengeAnalytics> {
    return this.http.get<ChallengeAnalytics>(`${this.apiUrl}/analytics`);
  }

  getChallengeParticipants(id: number, page: number = 0, size: number = 10): Observable<PageableResponse<ChallengeParticipant>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageableResponse<ChallengeParticipant>>(`${this.apiUrl}/${id}/participants`, { params });
  }

  createChallenge(request: ChallengeRequest): Observable<Challenge> {
    return this.http.post<Challenge>(this.apiUrl, request);
  }

  updateChallenge(id: number, request: ChallengeRequest): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.apiUrl}/${id}`, request);
  }

  moderateChallenge(id: number, action: 'APPROVE' | 'REJECT'): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.apiUrl}/${id}/moderate`, { action });
  }

  archiveChallenge(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  private categoriesCache$?: Observable<CarbonCategory[]>;

  getCarbonCategories(): Observable<CarbonCategory[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<CarbonCategory[]>(`${environment.apiUrl}/api/carbon/categories`).pipe(
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }
}
