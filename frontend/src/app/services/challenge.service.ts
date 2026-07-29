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

  getChallenges(page: number = 0, size: number = 10): Observable<PageableResponse<Challenge>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
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
}
