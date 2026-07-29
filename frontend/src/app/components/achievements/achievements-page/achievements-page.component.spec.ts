import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsPageComponent } from './achievements-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GamificationService } from '../../../services/gamification.service';
import { of } from 'rxjs';

describe('AchievementsPageComponent', () => {
  let component: AchievementsPageComponent;
  let fixture: ComponentFixture<AchievementsPageComponent>;
  const mockGamificationService = { getUserGamification: vi.fn(), getBadges: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AchievementsPageComponent],
      providers: [
        { provide: GamificationService, useValue: mockGamificationService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AchievementsPageComponent);
    component = fixture.componentInstance;
  });

  it('should test component creation and service integration', () => {
    mockGamificationService.getBadges.mockReturnValue(of([]));
    mockGamificationService.getUserGamification.mockReturnValue(of({ badges: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
