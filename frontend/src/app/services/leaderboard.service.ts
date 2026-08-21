import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeaderboardEntry, Page } from '../models/leaderboard.models';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGlobalLeaderboard(
    type: 'XP' | 'ECO_SCORE' = 'XP',
    period: 'ALL_TIME' | 'MONTHLY' | 'WEEKLY' = 'ALL_TIME',
    page: number = 0,
    size: number = 20
  ): Observable<Page<LeaderboardEntry>> {
    let params = new HttpParams()
      .set('type', type)
      .set('period', period)
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<LeaderboardEntry>>(`${this.apiUrl}/api/leaderboards/global`, { params });
  }

  getChallengeLeaderboard(
    challengeId: number,
    page: number = 0,
    size: number = 20
  ): Observable<Page<LeaderboardEntry>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<LeaderboardEntry>>(`${this.apiUrl}/api/leaderboards/challenge/${challengeId}`, { params });
  }

  getMyChallengeRank(challengeId: number): Observable<LeaderboardEntry> {
    return this.http.get<LeaderboardEntry>(`${this.apiUrl}/api/leaderboards/challenge/${challengeId}/my-rank`);
  }

  // Preserve for backward compatibility if needed by other components
  getAllTime(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/api/leaderboards/all-time`);
  }

  getMonthly(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/api/leaderboards/monthly`);
  }

  getWeekly(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/api/leaderboards/weekly`);
  }

  getMyRank(
    type: 'XP' | 'ECO_SCORE' = 'XP',
    period: 'ALL_TIME' | 'MONTHLY' | 'WEEKLY' = 'ALL_TIME'
  ): Observable<LeaderboardEntry> {
    let params = new HttpParams()
      .set('type', type)
      .set('period', period);
    return this.http.get<LeaderboardEntry>(`${this.apiUrl}/api/leaderboards/my-rank`, { params });
  }
}
