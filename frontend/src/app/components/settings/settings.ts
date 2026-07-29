import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';
import { UserProfileResponse, UpdateUserProfileRequest } from '../../models/profile.models';
import { NotificationPreference } from '../../models/notification.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, User, Bell, Save, Shield } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  notificationForm: FormGroup;
  
  isProfileLoading = false;
  isProfileSaving = false;
  profileError = '';
  profileSuccess = '';

  isNotificationLoading = false;
  isNotificationSaving = false;
  notificationError = '';
  notificationSuccess = '';

  // Icons
  UserIcon = User;
  BellIcon = Bell;
  SaveIcon = Save;
  ShieldIcon = Shield;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(100)]],
      lifestylePreferences: ['', [Validators.maxLength(255)]]
    });

    this.notificationForm = this.fb.group({
      eventType: [{ value: 'SYSTEM', disabled: true }],
      inAppEnabled: [true],
      emailEnabled: [true]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotificationPreferences();
  }

  loadProfile(): void {
    this.isProfileLoading = true;
    this.profileError = '';
    
    this.profileService.getMyProfile()
      .pipe(finalize(() => this.isProfileLoading = false))
      .subscribe({
        next: (profile: UserProfileResponse) => {
          this.profileForm.patchValue({
            bio: profile.bio || '',
            location: profile.location || '',
            lifestylePreferences: profile.lifestylePreferences || ''
          });
        },
        error: (err) => {
          console.error('Failed to load profile', err);
          this.profileError = 'Failed to load profile settings.';
        }
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isProfileSaving = true;
    this.profileError = '';
    
    const request: UpdateUserProfileRequest = this.profileForm.value;
    
    this.profileService.updateMyProfile(request)
      .pipe(finalize(() => this.isProfileSaving = false))
      .subscribe({
        next: () => {
          this.profileSuccess = 'Profile settings updated successfully.';
          setTimeout(() => this.profileSuccess = '', 3000);
        },
        error: (err) => {
          console.error('Failed to update profile', err);
          this.profileError = 'Failed to update profile settings.';
        }
      });
  }

  loadNotificationPreferences(): void {
    this.isNotificationLoading = true;
    this.notificationError = '';
    
    // We fetch a default preference like 'SYSTEM' since backend takes eventType
    // Ideally we would fetch multiple, but the API takes a single eventType
    this.notificationService.getPreference('SYSTEM')
      .pipe(finalize(() => this.isNotificationLoading = false))
      .subscribe({
        next: (pref: NotificationPreference) => {
          this.notificationForm.patchValue({
            eventType: pref.eventType,
            inAppEnabled: pref.inAppEnabled,
            emailEnabled: pref.emailEnabled
          });
        },
        error: (err) => {
          console.error('Failed to load notification preferences', err);
          this.notificationError = 'Failed to load notification preferences.';
        }
      });
  }

  saveNotificationPreferences(): void {
    if (this.notificationForm.invalid) {
      this.notificationForm.markAllAsTouched();
      return;
    }

    this.isNotificationSaving = true;
    this.notificationError = '';
    
    // getRawValue to include disabled controls
    const request: NotificationPreference = this.notificationForm.getRawValue();
    
    this.notificationService.updatePreference(request)
      .pipe(finalize(() => this.isNotificationSaving = false))
      .subscribe({
        next: () => {
          this.notificationSuccess = 'Notification preferences updated successfully.';
          setTimeout(() => this.notificationSuccess = '', 3000);
        },
        error: (err) => {
          console.error('Failed to update notification preferences', err);
          this.notificationError = 'Failed to update notification preferences.';
        }
      });
  }
}
