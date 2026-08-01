import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeDashboard } from './challenge-dashboard';

describe('ChallengeDashboard', () => {
  let component: ChallengeDashboard;
  let fixture: ComponentFixture<ChallengeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
