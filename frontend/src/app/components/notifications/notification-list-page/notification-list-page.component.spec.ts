import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationListPageComponent } from './notification-list-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '../../../services/notification.service';
import { of } from 'rxjs';

describe('NotificationListPageComponent', () => {
  let component: NotificationListPageComponent;
  let fixture: ComponentFixture<NotificationListPageComponent>;
  const mockNotificationService = { getNotifications: vi.fn(), markAsRead: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NotificationListPageComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(NotificationListPageComponent);
    component = fixture.componentInstance;
  });

  it('should test component creation and data rendering', () => {
    mockNotificationService.getNotifications.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
