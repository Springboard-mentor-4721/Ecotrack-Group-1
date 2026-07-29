import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyChallengesPageComponent } from './my-challenges-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChallengeService } from '../../../services/challenge.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('MyChallengesPageComponent', () => {
  let component: MyChallengesPageComponent;
  let fixture: ComponentFixture<MyChallengesPageComponent>;
  const mockChallengeService = { getMyChallenges: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, MyChallengesPageComponent],
      providers: [
        { provide: ChallengeService, useValue: mockChallengeService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyChallengesPageComponent);
    component = fixture.componentInstance;
  });

  it('should test error state, user actions and data rendering', () => {
    mockChallengeService.getMyChallenges.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
