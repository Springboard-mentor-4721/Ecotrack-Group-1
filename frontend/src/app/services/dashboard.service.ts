import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardResponse } from '../models/dashboard.models';
import { EcoTipResponse, TrendPredictionResponse, BehavioralInsightsResponse } from '../models/ai-models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/api/dashboard/user`);
  }

  getEcoTip(): Observable<EcoTipResponse> {
    return this.http.get<EcoTipResponse>(`${this.apiUrl}/api/dashboard/eco-tip`);
  }

  getTrendPrediction(): Observable<TrendPredictionResponse> {
    return this.http.get<TrendPredictionResponse>(`${this.apiUrl}/api/dashboard/trend-prediction`);
  }

  getBehavioralInsights(): Observable<BehavioralInsightsResponse> {
    return this.http.get<BehavioralInsightsResponse>(`${this.apiUrl}/api/dashboard/behavioral-insights`);
  }
}
