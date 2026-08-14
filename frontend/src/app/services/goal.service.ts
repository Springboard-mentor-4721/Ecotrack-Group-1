import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageableResponse } from '../models/carbon.models';
import { 
  GoalResponse, 
  GoalRequest, 
  GoalProgressResponse, 
  GoalProgressRequest, 
  GoalAnalyticsResponse,
  GoalOptimizationResponse
} from '../models/goal.models';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGoals(page: number = 0, size: number = 20): Observable<PageableResponse<GoalResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageableResponse<GoalResponse>>(`${this.apiUrl}/api/goals`, { params });
  }

  getGoal(id: number): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(`${this.apiUrl}/api/goals/${id}`);
  }

  createGoal(data: GoalRequest): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(`${this.apiUrl}/api/goals`, data);
  }

  updateGoal(id: number, data: GoalRequest): Observable<GoalResponse> {
    return this.http.put<GoalResponse>(`${this.apiUrl}/api/goals/${id}`, data);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/goals/${id}`);
  }

  addProgress(id: number, data: GoalProgressRequest): Observable<GoalProgressResponse> {
    return this.http.post<GoalProgressResponse>(`${this.apiUrl}/api/goals/${id}/progress`, data);
  }

  getGoalProgress(id: number): Observable<GoalProgressResponse[]> {
    return this.http.get<GoalProgressResponse[]>(`${this.apiUrl}/api/goals/${id}/progress`);
  }

  getAnalytics(id: number): Observable<GoalAnalyticsResponse> {
    return this.http.get<GoalAnalyticsResponse>(`${this.apiUrl}/api/goals/${id}/analytics`);
  }

  optimizeGoal(data: GoalRequest): Observable<GoalOptimizationResponse> {
    return this.http.post<GoalOptimizationResponse>(`${this.apiUrl}/api/goals/optimize`, data);
  }
}
