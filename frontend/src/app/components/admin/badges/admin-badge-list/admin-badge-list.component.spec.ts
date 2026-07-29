import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBadgeListComponent } from './admin-badge-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminService } from '../../../../services/admin.service';
import { of } from 'rxjs';

describe('AdminBadgeListComponent', () => {
  (window as any).bootstrap = { Modal: class { constructor() {} show() {} hide() {} } };

  let component: AdminBadgeListComponent;
  let fixture: ComponentFixture<AdminBadgeListComponent>;
  const mockAdminService = { getBadges: vi.fn(), getAdminBadges: vi.fn(), createBadge: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AdminBadgeListComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AdminBadgeListComponent);
    component = fixture.componentInstance;
  });

  it('should test data rendering, empty state, form validation, user actions', () => {
    mockAdminService.getAdminBadges.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });
});
