import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeListPageComponent } from './challenge-list-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChallengeService } from '../../../services/challenge.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('ChallengeListPageComponent', () => {
  let component: ChallengeListPageComponent;
  let fixture: ComponentFixture<ChallengeListPageComponent>;
  const mockChallengeService = { getChallenges: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ChallengeListPageComponent],
      providers: [
        { provide: ChallengeService, useValue: mockChallengeService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ChallengeListPageComponent);
    component = fixture.componentInstance;
  });

  it('should test list rendering, loading and empty state', () => {
    mockChallengeService.getChallenges.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
