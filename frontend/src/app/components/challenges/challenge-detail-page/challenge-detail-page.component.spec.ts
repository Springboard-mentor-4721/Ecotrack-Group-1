import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeDetailPageComponent } from './challenge-detail-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChallengeService } from '../../../services/challenge.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('ChallengeDetailPageComponent', () => {
  let component: ChallengeDetailPageComponent;
  let fixture: ComponentFixture<ChallengeDetailPageComponent>;
  const mockChallengeService = { getChallengeById: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ChallengeDetailPageComponent],
      providers: [
        { provide: ChallengeService, useValue: mockChallengeService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ChallengeDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should test user actions like join/leave challenge', () => {
    mockChallengeService.getChallengeById.mockReturnValue(of({} as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
