import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CarbonEntryService } from '../../services/carbon-entry.service';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const mockCarbonService = { getDashboardSummary: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReportsComponent],
      providers: [
        { provide: CarbonEntryService, useValue: mockCarbonService },
        DatePipe
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  });

  it('should test initialization and API handling', () => {
    mockCarbonService.getDashboardSummary.mockReturnValue(of({ categorySummaries: [] } as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });
});
