import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignPreview } from './campaign-preview';

describe('CampaignPreview', () => {
  let component: CampaignPreview;
  let fixture: ComponentFixture<CampaignPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(CampaignPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
