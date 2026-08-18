import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminAnalyticsFilter {
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

export interface AnalyticsTrendPointDTO {
  label: string;
  value: number;
}

export interface AnalyticsDistributionDTO {
  category: string;
  value: number;
}

export interface AdminOverviewAnalyticsDTO {
  totalUsers: number;
  activeUsers: number;
  totalXp: number;
  totalBadgesAwarded: number;
  totalChallenges: number;
  totalCarbonImpact: number;
}

export interface AdminUserAnalyticsDTO {
  totalUsers: number;
  newUsersInPeriod: number;
  statusDistribution: AnalyticsDistributionDTO[];
  roleDistribution: AnalyticsDistributionDTO[];
  registrationTrend: AnalyticsTrendPointDTO[];
}

export interface AdminGamificationAnalyticsDTO {
  totalPlatformXp: number;
  xpAwardedInPeriod: number;
  averageEcoScore: number;
  levelDistribution: AnalyticsDistributionDTO[];
  xpSourceDistribution: AnalyticsDistributionDTO[];
  xpEarnedTrend: AnalyticsTrendPointDTO[];
}

export interface AdminBadgeAnalyticsDTO {
  totalBadgesAwarded: number;
  badgesAwardedInPeriod: number;
  badgeTypeDistribution: AnalyticsDistributionDTO[];
  mostAwardedBadges: AnalyticsDistributionDTO[];
}

export interface AdminChallengeAnalyticsDTO {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  xpDistributedInPeriod: number;
  statusDistribution: AnalyticsDistributionDTO[];
  metricDistribution: AnalyticsDistributionDTO[];
}

export interface AdminSustainabilityAnalyticsDTO {
  totalCarbonImpact: number;
  carbonImpactInPeriod: number;
  impactByCategory: AnalyticsDistributionDTO[];
  carbonTrend: AnalyticsTrendPointDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private apiUrl = environment.apiUrl + '/api/admin/analytics';
  private http = inject(HttpClient);

  private buildParams(filter?: AdminAnalyticsFilter): HttpParams {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.timezone) params = params.set('timezone', filter.timezone);
    }
    return params;
  }

  getOverview(filter?: AdminAnalyticsFilter): Observable<AdminOverviewAnalyticsDTO> {
    return this.http.get<AdminOverviewAnalyticsDTO>(`${this.apiUrl}/overview`, { params: this.buildParams(filter) });
  }

  getUserAnalytics(filter?: AdminAnalyticsFilter): Observable<AdminUserAnalyticsDTO> {
    return this.http.get<AdminUserAnalyticsDTO>(`${this.apiUrl}/users`, { params: this.buildParams(filter) });
  }

  getGamificationAnalytics(filter?: AdminAnalyticsFilter): Observable<AdminGamificationAnalyticsDTO> {
    return this.http.get<AdminGamificationAnalyticsDTO>(`${this.apiUrl}/gamification`, { params: this.buildParams(filter) });
  }

  getBadgeAnalytics(filter?: AdminAnalyticsFilter): Observable<AdminBadgeAnalyticsDTO> {
    return this.http.get<AdminBadgeAnalyticsDTO>(`${this.apiUrl}/badges`, { params: this.buildParams(filter) });
  }

  getChallengeAnalytics(filter?: AdminAnalyticsFilter): Observable<AdminChallengeAnalyticsDTO> {
    return this.http.get<AdminChallengeAnalyticsDTO>(`${this.apiUrl}/challenges`, { params: this.buildParams(filter) });
  }

  getSustainabilityAnalytics(filter?: AdminAnalyticsFilter): Observable<AdminSustainabilityAnalyticsDTO> {
    return this.http.get<AdminSustainabilityAnalyticsDTO>(`${this.apiUrl}/sustainability`, { params: this.buildParams(filter) });
  }

  downloadExport(format: 'pdf' | 'excel' | 'csv', filter?: AdminAnalyticsFilter): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${format}`, { params: this.buildParams(filter), responseType: 'blob' });
  }
}
