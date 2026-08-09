import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification, NotificationPreference } from '../models/notification.models';
import { PageableResponse } from '../models/carbon.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;
  private unreadCountRefreshSubject = new Subject<void>();
  unreadCountRefresh$ = this.unreadCountRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(page: number = 0, size: number = 10, unreadOnly: boolean = false): Observable<PageableResponse<Notification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('unreadOnly', unreadOnly.toString());
    
    return this.http.get<PageableResponse<Notification>>(`${this.apiUrl}/api/notifications`, { params });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/notifications/${id}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/api/notifications/unread-count`);
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/notifications/read-all`, {});
  }

  getPreference(eventType: string): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.apiUrl}/api/notifications/preferences/${eventType}`);
  }

  updatePreference(preference: NotificationPreference): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.apiUrl}/api/notifications/preferences`, preference);
  }

  triggerUnreadCountRefresh(): void {
    this.unreadCountRefreshSubject.next();
  }
}
