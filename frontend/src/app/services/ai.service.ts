import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  AiInsightsResponse, 
  JournalSummaryResponse,
  EcoTipResponse
} from '../models/ai-models';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEcoTip(): Observable<EcoTipResponse> {
    return this.http.get<EcoTipResponse>(`${this.apiUrl}/api/dashboard/eco-tip`);
  }

  getLatestInsights(): Observable<AiInsightsResponse> {
    return this.http.get<AiInsightsResponse>(`${this.apiUrl}/api/dashboard/ai/insights`);
  }

  generateInsights(): Observable<AiInsightsResponse> {
    return this.http.post<AiInsightsResponse>(`${this.apiUrl}/api/dashboard/ai/insights/generate`, null);
  }



  getJournalSummary(): Observable<JournalSummaryResponse> {
    return this.http.get<JournalSummaryResponse>(`${this.apiUrl}/api/carbon/journal-summary`);
  }

  generateJournalSummary(): Observable<JournalSummaryResponse> {
    return this.http.post<JournalSummaryResponse>(`${this.apiUrl}/api/carbon/ai/journal-summary`, null);
  }

  getAiHistory(type?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = `?page=${page}&size=${size}`;
    if (type && type !== 'ALL') {
      params += `&type=${type}`;
    }
    return this.http.get<any>(`${this.apiUrl}/api/ai/history${params}`);
  }
}
