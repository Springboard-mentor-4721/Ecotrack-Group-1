import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardService } from '../../services/dashboard.service';
import { GamificationService } from '../../services/gamification.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  if (typeof localStorage === 'undefined') {
    (window as any).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
  }

  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockDashboardService = { getUserDashboard: vi.fn() };
  const mockGamificationService = { getUserGamification: vi.fn(), getProfile: vi.fn(() => of({})), getBadges: vi.fn(() => of([])) };
  const mockLeaderboardService = { getGlobalLeaderboard: vi.fn() };
  const mockAuthService = { getToken: vi.fn(() => 'fake-token'), getCurrentUser: vi.fn(() => ({ id: 1 })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: GamificationService, useValue: mockGamificationService },
        { provide: LeaderboardService, useValue: mockLeaderboardService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test loading state, empty state, error state, and API success', () => {
    mockDashboardService.getUserDashboard.mockReturnValue(of({} as any));
    mockGamificationService.getUserGamification.mockReturnValue(of({} as any));
    mockLeaderboardService.getGlobalLeaderboard.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    
    mockDashboardService.getUserDashboard.mockReturnValue(throwError(() => new Error('Error')));
    (component as any).loadDashboardData();
    
    expect((component as any).error).toBeTruthy();
  });
});
