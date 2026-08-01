import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipSelector } from './chip-selector';

describe('ChipSelector', () => {
  let component: ChipSelector;
  let fixture: ComponentFixture<ChipSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
