import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingBadge } from './tracking-badge';

describe('TrackingBadge', () => {
  let component: TrackingBadge;
  let fixture: ComponentFixture<TrackingBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
