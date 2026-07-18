import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { UserProfileResponse } from '../../models/profile.models';
import { finalize } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSkeletonComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: UserProfileResponse | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(500)]],
      profilePictureUrl: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(150)]],
      lifestylePreferences: [''] // E.g., JSON string or text
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getMyProfile()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.profileForm.patchValue({
            bio: data.bio || '',
            profilePictureUrl: data.profilePictureUrl || '',
            location: data.location || '',
            lifestylePreferences: data.lifestylePreferences || ''
          });
        },
        error: (err) => {
          this.errorMessage = 'Failed to load profile. Please try again later.';
          console.error('Error fetching profile:', err);
        }
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.profileService.updateMyProfile(this.profileForm.value)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.successMessage = 'Profile updated successfully!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update profile. Please verify your inputs.';
          console.error('Error updating profile:', err);
        }
      });
  }

  cancelChanges(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        bio: this.profile.bio || '',
        profilePictureUrl: this.profile.profilePictureUrl || '',
        location: this.profile.location || '',
        lifestylePreferences: this.profile.lifestylePreferences || ''
      });
      this.profileForm.markAsPristine();
    }
  }

  get profileCompletion(): number {
    if (!this.profile) return 0;
    let completedFields = 0;
    const totalFields = 4;
    
    if (this.profile.bio && this.profile.bio.trim().length > 0) completedFields++;
    if (this.profile.location && this.profile.location.trim().length > 0) completedFields++;
    if (this.profile.profilePictureUrl && this.profile.profilePictureUrl.trim().length > 0) completedFields++;
    if (this.profile.lifestylePreferences && this.profile.lifestylePreferences.trim().length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  get locationLength(): number {
    return this.profileForm.get('location')?.value?.length || 0;
  }

  get missingFields(): string[] {
    const missing = [];
    if (!this.profile?.profilePictureUrl) missing.push('Profile Picture');
    if (!this.profile?.bio) missing.push('Bio');
    if (!this.profile?.location) missing.push('Location');
    if (!this.profile?.lifestylePreferences) missing.push('Lifestyle Preferences');
    return missing;
  }
}
