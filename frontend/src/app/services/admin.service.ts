import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSummaryResponse, UserDetailResponse, UpdateUserStatusRequest, AdminDashboardResponse } from '../models/admin.models';
import { PageableResponse } from '../models/carbon.models';
import { Challenge, ChallengeRequest } from '../models/challenge.models';
import { AdminBadge, BadgeDefinitionRequest } from '../models/gamification.models';

export interface AdminDashboardPulseDTO {
  totalUsers: number;
  activeChallengesCount: number;
  upcomingChallengesCount: number;
  completedChallengesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 0, size: number = 10, search?: string): Observable<PageableResponse<UserSummaryResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    
    return this.http.get<PageableResponse<UserSummaryResponse>>(`${this.apiUrl}/api/admin/users`, { params });
  }

  getUserById(id: number): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.apiUrl}/api/admin/users/${id}`);
  }

  getUserChallengeHistory(userId: number, page: number = 0, size: number = 10): Observable<PageableResponse<any>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageableResponse<any>>(`${this.apiUrl}/api/admin/users/${userId}/challenges`, { params });
  }

  updateUserStatus(id: number, status: string): Observable<UserDetailResponse> {
    const payload: UpdateUserStatusRequest = { status };
    return this.http.put<UserDetailResponse>(`${this.apiUrl}/api/admin/users/${id}/status`, payload);
  }

  updateUserRole(id: number, role: string): Observable<UserDetailResponse> {
    return this.http.put<UserDetailResponse>(`${this.apiUrl}/api/admin/users/${id}/role`, { role });
  }

  getDashboardSummary(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/api/admin/dashboard`);
  }

  getDashboardPulse(): Observable<AdminDashboardPulseDTO> {
    return this.http.get<AdminDashboardPulseDTO>(`${this.apiUrl}/api/admin/dashboard/pulse`);
  }
  // Challenge Admin
  getAdminChallenges(page: number = 0, size: number = 10): Observable<PageableResponse<Challenge>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageableResponse<Challenge>>(`${this.apiUrl}/api/admin/challenges`, { params });
  }

  createChallenge(request: ChallengeRequest): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.apiUrl}/api/admin/challenges`, request);
  }

  updateChallenge(id: number, request: ChallengeRequest): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.apiUrl}/api/admin/challenges/${id}`, request);
  }

  moderateChallenge(id: number, action: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/admin/challenges/${id}/moderate`, { action });
  }
  archiveChallenge(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/admin/challenges/${id}/archive`, {});
  }

  // Badge Admin
  getAdminBadges(page: number = 0, size: number = 10, type?: string): Observable<PageableResponse<AdminBadge>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<PageableResponse<AdminBadge>>(`${this.apiUrl}/api/admin/badges`, { params });
  }

  createBadge(request: BadgeDefinitionRequest): Observable<AdminBadge> {
    return this.http.post<AdminBadge>(`${this.apiUrl}/api/admin/badges`, request);
  }

  updateBadge(id: number, request: BadgeDefinitionRequest): Observable<AdminBadge> {
    return this.http.put<AdminBadge>(`${this.apiUrl}/api/admin/badges/${id}`, request);
  }

  disableBadge(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/admin/badges/${id}/disable`, {});
  }
}
