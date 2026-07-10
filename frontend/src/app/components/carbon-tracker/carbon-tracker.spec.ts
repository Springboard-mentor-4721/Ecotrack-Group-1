import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonTracker } from './carbon-tracker';

describe('CarbonTracker', () => {
  let component: CarbonTracker;
  let fixture: ComponentFixture<CarbonTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarbonTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(CarbonTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
