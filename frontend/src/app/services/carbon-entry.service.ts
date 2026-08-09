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
import { SmartSuggestionResponse, JournalSummaryResponse } from '../models/ai-models';

@Injectable({
  providedIn: 'root'
})
export class CarbonEntryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEntries(
    page: number = 0, size: number = 20, 
    categoryId?: number, subCategoryId?: number, 
    search?: string, 
    startDate?: string, endDate?: string, 
    emissionMin?: number, emissionMax?: number,
    quantityMin?: number, quantityMax?: number,
    sort?: string
  ): Observable<PageableResponse<CarbonEntryResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (categoryId) params = params.set('category', categoryId.toString());
    if (subCategoryId) params = params.set('subCategory', subCategoryId.toString());
    if (search) params = params.set('search', search);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (emissionMin != null) params = params.set('emissionMin', emissionMin.toString());
    if (emissionMax != null) params = params.set('emissionMax', emissionMax.toString());
    if (quantityMin != null) params = params.set('quantityMin', quantityMin.toString());
    if (quantityMax != null) params = params.set('quantityMax', quantityMax.toString());
    if (sort) params = params.set('sort', sort);
    
    return this.http.get<PageableResponse<CarbonEntryResponse>>(`${this.apiUrl}/api/carbon`, { params });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/carbon/categories`);
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

  getSmartSuggestions(entryId: number): Observable<SmartSuggestionResponse> {
    return this.http.get<SmartSuggestionResponse>(`${this.apiUrl}/api/carbon/${entryId}/smart-suggestion`);
  }

  getJournalSummary(timeframe: string = 'weekly', startDate?: string, endDate?: string): Observable<JournalSummaryResponse> {
    let params = new HttpParams().set('timeframe', timeframe);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<JournalSummaryResponse>(`${this.apiUrl}/api/carbon/journal-summary`, { params });
  }
}
