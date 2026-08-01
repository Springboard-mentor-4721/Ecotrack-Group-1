import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeCreate } from './challenge-create';

describe('ChallengeCreate', () => {
  let component: ChallengeCreate;
  let fixture: ComponentFixture<ChallengeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
