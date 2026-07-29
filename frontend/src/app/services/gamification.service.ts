import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GamificationProfile, Badge, XpLedgerEntry } from '../models/gamification.models';
import { PageableResponse } from '../models/carbon.models';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<GamificationProfile> {
    return this.http.get<GamificationProfile>(`${this.apiUrl}/api/gamification/profile`);
  }

  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/api/gamification/badges`);
  }

  getXpHistory(page: number = 0, size: number = 10): Observable<PageableResponse<XpLedgerEntry>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageableResponse<XpLedgerEntry>>(`${this.apiUrl}/api/gamification/xp-history`, { params });
  }
}
