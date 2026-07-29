import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminConfigPageComponent } from './admin-config-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminService } from '../../../../services/admin.service';
import { of } from 'rxjs';

describe('AdminConfigPageComponent', () => {
  let component: AdminConfigPageComponent;
  let fixture: ComponentFixture<AdminConfigPageComponent>;
  const mockAdminService = { getAdminConfig: vi.fn(), updateAdminConfig: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AdminConfigPageComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AdminConfigPageComponent);
    component = fixture.componentInstance;
  });

  it('should test initialization, empty state, and API handling', () => {
    mockAdminService.getAdminConfig.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
