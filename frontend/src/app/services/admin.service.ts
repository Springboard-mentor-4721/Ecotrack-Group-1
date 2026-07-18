import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSummaryResponse, UserDetailResponse, UpdateUserStatusRequest, AdminDashboardResponse } from '../models/admin.models';
import { PageableResponse } from '../models/carbon.models';

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

  updateUserStatus(id: number, status: string): Observable<UserDetailResponse> {
    const payload: UpdateUserStatusRequest = { status };
    return this.http.put<UserDetailResponse>(`${this.apiUrl}/api/admin/users/${id}/status`, payload);
  }

  getDashboardSummary(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/api/admin/dashboard`);
  }
}
