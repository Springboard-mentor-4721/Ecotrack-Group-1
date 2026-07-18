import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  CarbonEntryResponse,
  CarbonSummaryResponse,
  CreateCarbonEntryRequest,
  PageableResponse,
  UpdateCarbonEntryRequest
} from '../models/carbon.models';

@Injectable({
  providedIn: 'root'
})
export class CarbonEntryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEntries(page: number = 0, size: number = 20): Observable<PageableResponse<CarbonEntryResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageableResponse<CarbonEntryResponse>>(`${this.apiUrl}/api/carbon`, { params });
  }

  getEntryById(id: number): Observable<CarbonEntryResponse> {
    return this.http.get<CarbonEntryResponse>(`${this.apiUrl}/api/carbon/${id}`);
  }

  createEntry(data: CreateCarbonEntryRequest): Observable<CarbonEntryResponse> {
    return this.http.post<CarbonEntryResponse>(`${this.apiUrl}/api/carbon`, data);
  }

  updateEntry(id: number, data: UpdateCarbonEntryRequest): Observable<CarbonEntryResponse> {
    return this.http.put<CarbonEntryResponse>(`${this.apiUrl}/api/carbon/${id}`, data);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/carbon/${id}`);
  }

  getDashboardSummary(startDate: string, endDate: string): Observable<CarbonSummaryResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<CarbonSummaryResponse>(`${this.apiUrl}/api/carbon/summary`, { params });
  }
}
