import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCarbonReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<any>(`${this.apiUrl}/api/reports/carbon`, { params });
  }

  getGoalReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<any>(`${this.apiUrl}/api/reports/goals`, { params });
  }

  getChallengeReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<any>(`${this.apiUrl}/api/reports/challenges`, { params });
  }

  getSustainabilityReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate).set('format', 'JSON');
    return this.http.get<any>(`${this.apiUrl}/api/reports/sustainability`, { params });
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
