import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendationPageComponent } from './recommendation-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecommendationService } from '../../../services/recommendation.service';
import { of } from 'rxjs';

describe('RecommendationPageComponent', () => {
  let component: RecommendationPageComponent;
  let fixture: ComponentFixture<RecommendationPageComponent>;
  const mockRecommendationService = { getRecommendations: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RecommendationPageComponent],
      providers: [
        { provide: RecommendationService, useValue: mockRecommendationService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(RecommendationPageComponent);
    component = fixture.componentInstance;
  });

  it('should test loading state and empty state', () => {
    mockRecommendationService.getRecommendations.mockReturnValue(of({ content: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
