import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeConfig } from './challenge-config';

describe('ChallengeConfig', () => {
  let component: ChallengeConfig;
  let fixture: ComponentFixture<ChallengeConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
