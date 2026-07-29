import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  const mockProfileService = { getMyProfile: vi.fn(), updateMyProfile: vi.fn() };
  const mockNotificationService = { getPreference: vi.fn(), updatePreference: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, SettingsComponent],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test form validation and API handling', () => {
    mockProfileService.getMyProfile.mockReturnValue(of({ bio: 'Test' } as any));
    mockNotificationService.getPreference.mockReturnValue(of({ inAppEnabled: true } as any));
    fixture.detectChanges();
    
    expect(component.profileForm.get('bio')?.value).toBe('Test');
    component.profileForm.patchValue({ bio: 'A'.repeat(501) });
    expect(component.profileForm.invalid).toBe(true);
    
    mockProfileService.updateMyProfile.mockReturnValue(of({}));
    component.profileForm.patchValue({ bio: 'Valid' });
    component.saveProfile();
    expect(component.profileSuccess).toBeTruthy();
  });
});
