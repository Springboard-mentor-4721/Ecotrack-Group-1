import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Challenge, ChallengeDetail, ChallengeParticipant, ChallengeProgressUpdateRequest } from '../models/challenge.models';
import { PageableResponse } from '../models/carbon.models';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getChallenges(
    page: number = 0, 
    size: number = 10,
    search?: string,
    evaluationType?: string,
    trackingMethod?: string,
    sort?: string
  ): Observable<PageableResponse<Challenge>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (search) params = params.set('search', search);
    if (evaluationType && evaluationType !== 'ALL') params = params.set('evaluationType', evaluationType);
    if (trackingMethod && trackingMethod !== 'ALL') params = params.set('trackingMethod', trackingMethod);
    if (sort) params = params.set('sort', sort);
    
    return this.http.get<PageableResponse<Challenge>>(`${this.apiUrl}/api/challenges`, { params });
  }

  getChallengeDetail(id: number): Observable<ChallengeDetail> {
    return this.http.get<ChallengeDetail>(`${this.apiUrl}/api/challenges/${id}`);
  }

  joinChallenge(id: number): Observable<ChallengeParticipant> {
    return this.http.post<ChallengeParticipant>(`${this.apiUrl}/api/challenges/${id}/join`, {});
  }

  getMyChallenges(page: number = 0, size: number = 10): Observable<PageableResponse<ChallengeParticipant>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageableResponse<ChallengeParticipant>>(`${this.apiUrl}/api/challenges/my`, { params });
  }

  updateProgress(id: number, delta: number): Observable<ChallengeParticipant> {
    const payload: ChallengeProgressUpdateRequest = { delta };
    return this.http.put<ChallengeParticipant>(`${this.apiUrl}/api/challenges/${id}/progress`, payload);
  }

  getChallengeParticipants(id: number, page: number = 0, size: number = 5, sort: string = 'progress,desc'): Observable<PageableResponse<ChallengeParticipant>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    
    return this.http.get<PageableResponse<ChallengeParticipant>>(`${this.apiUrl}/api/challenges/${id}/participants`, { params });
  }
}
