import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  OverviewReportDTO,
  XpActivityPageDTO,
  CarbonReportDTO,
  GoalReportDTO,
  ChallengeReportDTO,
  SustainabilityReportDTO,
  SustainabilityAnalyticsDTO,
  CarbonAnalyticsDTO,
  CarbonEntryPageDTO,
  GoalAnalyticsDTO,
  GoalPerformancePageDTO,

  ChallengeAnalyticsDTO,
  ChallengePerformancePageDTO,
} from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOverviewReport(startDate: string, endDate: string): Observable<OverviewReportDTO> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<OverviewReportDTO>(`${this.apiUrl}/api/reports/overview`, { params });
  }



  getGoalAnalytics(startDate: string, endDate: string): Observable<GoalAnalyticsDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<GoalAnalyticsDTO>(`${this.apiUrl}/api/reports/goals/analytics`, { params });
  }

  getGoalPerformance(startDate: string, endDate: string, page: number = 0, size: number = 10): Observable<GoalPerformancePageDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GoalPerformancePageDTO>(`${this.apiUrl}/api/reports/goals/performance`, { params });
  }

  getCarbonAnalytics(startDate: string, endDate: string): Observable<CarbonAnalyticsDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<CarbonAnalyticsDTO>(`${this.apiUrl}/api/reports/carbon/analytics`, { params });
  }

  getCarbonEntries(startDate: string, endDate: string, page: number = 0, size: number = 10): Observable<CarbonEntryPageDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CarbonEntryPageDTO>(`${this.apiUrl}/api/reports/carbon/entries`, { params });
  }

  getXpActivityReport(startDate: string, endDate: string, page: number = 0, size: number = 10): Observable<XpActivityPageDTO> {
    const params = new HttpParams()
        .set('startDate', startDate)
        .set('endDate', endDate)
        .set('page', page.toString())
        .set('size', size.toString());
    return this.http.get<XpActivityPageDTO>(`${this.apiUrl}/api/reports/xp`, { params });
  }

  getCarbonReport(startDate: string, endDate: string): Observable<CarbonReportDTO> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<CarbonReportDTO>(`${this.apiUrl}/api/reports/carbon`, { params });
  }

  getGoalReport(startDate: string, endDate: string): Observable<GoalReportDTO> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<GoalReportDTO>(`${this.apiUrl}/api/reports/goals`, { params });
  }

  getChallengeAnalytics(startDate: string, endDate: string): Observable<ChallengeAnalyticsDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ChallengeAnalyticsDTO>(`${this.apiUrl}/api/reports/challenges/analytics`, { params });
  }

  getChallengePerformance(startDate: string, endDate: string, page: number = 0, size: number = 10): Observable<ChallengePerformancePageDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ChallengePerformancePageDTO>(`${this.apiUrl}/api/reports/challenges/performance`, { params });
  }

  getChallengeReport(startDate: string, endDate: string): Observable<ChallengeReportDTO> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<ChallengeReportDTO>(`${this.apiUrl}/api/reports/challenges`, { params });
  }


  getSustainabilityAnalytics(startDate: string, endDate: string): Observable<SustainabilityAnalyticsDTO> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SustainabilityAnalyticsDTO>(`${this.apiUrl}/api/reports/sustainability/analytics`, { params });
  }

  getSustainabilityReport(startDate: string, endDate: string): Observable<SustainabilityReportDTO> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<SustainabilityReportDTO>(`${this.apiUrl}/api/reports/sustainability`, { params });
  }

  exportReportBlob(reportType: string, format: string, startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', format);
    let endpoint = 'carbon';
    if (reportType === 'goals') endpoint = 'goals';
    if (reportType === 'challenges') endpoint = 'challenges';
    if (reportType === 'sustainability') endpoint = 'sustainability';

    return this.http.get(`${this.apiUrl}/api/reports/${endpoint}`, { params, responseType: 'blob' });
  }
}
