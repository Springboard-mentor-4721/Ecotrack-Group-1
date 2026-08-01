import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleBuilder } from './rule-builder';

describe('RuleBuilder', () => {
  let component: RuleBuilder;
  let fixture: ComponentFixture<RuleBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
