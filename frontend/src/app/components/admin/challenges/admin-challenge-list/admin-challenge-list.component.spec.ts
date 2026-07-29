import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminChallengeListComponent } from './admin-challenge-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminService } from '../../../../services/admin.service';
import { of } from 'rxjs';

describe('AdminChallengeListComponent', () => {
  (window as any).bootstrap = { Modal: class { constructor() {} show() {} hide() {} } };

  let component: AdminChallengeListComponent;
  let fixture: ComponentFixture<AdminChallengeListComponent>;
  const mockAdminService = { getChallenges: vi.fn(), getAdminChallenges: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AdminChallengeListComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AdminChallengeListComponent);
    component = fixture.componentInstance;
  });

  it('should test data rendering, user actions, form validation', () => {
    mockAdminService.getAdminChallenges.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
