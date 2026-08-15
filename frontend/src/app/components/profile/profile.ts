import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { UserProfileResponse } from '../../models/profile.models';
import { GamificationService } from '../../services/gamification.service';
import { GamificationProfile, Badge, XpLedgerEntry } from '../../models/gamification.models';
import { NotificationService } from '../../services/notification.service';
import { NotificationPreference } from '../../models/notification.models';
import { environment } from '../../../environments/environment';
import { finalize, forkJoin } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { EcoScoreColorPipe } from '../../shared/pipes/eco-score-color.pipe';
import { BadgeEmblemComponent } from '../../shared/components/badge-emblem/badge-emblem.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSkeletonComponent, ImageCropperComponent, EcoScoreColorPipe, BadgeEmblemComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile = signal<UserProfileResponse | null>(null);
  gamificationProfile = signal<GamificationProfile | null>(null);
  recentBadges = signal<Badge[]>([]);
  recentActivity = signal<XpLedgerEntry[]>([]);

  notificationPrefs = signal<NotificationPreference[]>([]);
  prefSuccessMessage = signal('');
  prefErrorMessage = signal('');
  isSavingPrefs = signal(false);

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  uploadProgress = signal(0);
  timestamp = signal(Date.now());
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isUploading = signal(false);

  // Cropper State
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;

  // Delete Modal
  showDeleteConfirm = false;

  // Drag and Drop
  isDragging = signal(false);

  apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private gamificationService: GamificationService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(150)]],
      lifestylePreferences: [''] // E.g., JSON string or text
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);

    forkJoin({
      profile: this.profileService.getMyProfile(),
      gamification: this.gamificationService.getProfile(),
      badges: this.gamificationService.getBadges(),
      xpHistory: this.gamificationService.getXpHistory(0, 5),
      prefBadge: this.notificationService.getPreference('BADGE_EARNED'),
      prefChallenge: this.notificationService.getPreference('CHALLENGE_COMPLETED'),
      prefGoal: this.notificationService.getPreference('GOAL_ACHIEVED'),
      prefLevel: this.notificationService.getPreference('LEVEL_UP'),
      prefStreak: this.notificationService.getPreference('STREAK_MILESTONE')
    }).pipe(finalize(() => {
      this.isLoading.set(false);
    })).subscribe({
      next: (data) => {
        this.profile.set(data.profile);
        this.gamificationProfile.set(data.gamification);
        this.recentBadges.set(data.badges.filter(b => b.isEarned).slice(0, 4));
        this.recentActivity.set(data.xpHistory.content);

        this.notificationPrefs.set([
          data.prefBadge, data.prefChallenge, data.prefGoal, data.prefLevel, data.prefStreak
        ]);

        this.profileForm.patchValue({
          bio: this.profile()?.bio || '',
          location: this.profile()?.location || '',
          lifestylePreferences: this.profile()?.lifestylePreferences || ''
        });
      },
      error: (err) => {
        this.errorMessage.set('Failed to load profile. Please try again later.');
        console.error('Error fetching profile:', err);
      }
    });
  }

  // Drag and Drop
  onDragOver(event: any): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: any): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file, event);
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file, event);
    }
  }

  handleFile(file: File, event: any): void {
    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage.set('Invalid file format. Only JPG, JPEG, PNG, WEBP are allowed.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File size exceeds 5MB limit.');
      return;
    }

    this.errorMessage.set('');
    this.imageChangedEvent = event;
    this.showCropper = true;
    document.body.style.overflow = 'hidden';
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage = event.objectUrl;
      this.selectedImageFile = new File([event.blob], "avatar.webp", { type: 'image/webp' });
    }
  }

  imageLoaded(): void {
    // show cropper
  }

  cropperReady(): void {
    // cropper ready
  }

  loadImageFailed(): void {
    this.errorMessage.set('Failed to load image. Please try another file.');
    this.showCropper = false;
    document.body.style.overflow = '';
  }

  cancelCrop(): void {
    this.showCropper = false;
    document.body.style.overflow = '';
    this.imageChangedEvent = '';
    this.selectedImageFile = null;
    this.croppedImage = '';
  }

  confirmCrop(): void {
    if (this.selectedImageFile) {
      this.showCropper = false;
      document.body.style.overflow = '';
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (!this.selectedImageFile) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    this.profileService.uploadAvatar(this.selectedImageFile)
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.uploadProgress.set(Math.round(100 * event.loaded / event.total));
            }
          } else if (event.type === HttpEventType.Response) {
            this.uploadProgress.set(100);
            this.successMessage.set('Profile picture updated successfully!');
            this.selectedImageFile = null;
            this.imagePreviewUrl = null;
            this.isUploading.set(false);
            const p = this.profile();
            if (p) {
              this.profile.update(current => ({ ...current!, profilePictureUrl: event.body.imageUrl }));
              this.timestamp.set(Date.now());
            }
            setTimeout(() => {
              this.successMessage.set('');
            }, 3000);
          }
        },
        error: (err) => {
          this.isUploading.set(false);
          this.uploadProgress.set(0);
          this.errorMessage.set(err.error?.message || 'Failed to upload profile picture.');
          console.error('Error uploading avatar:', err);
        }
      });
  }

  confirmRemove(): void {
    this.showDeleteConfirm = true;
    document.body.style.overflow = 'hidden';
  }

  cancelRemove(): void {
    this.showDeleteConfirm = false;
    document.body.style.overflow = '';
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http')) return url + '?v=' + this.timestamp();

    // Fallback to explicit localhost if environment fails
    const backendUrl = environment.apiUrl || 'http://localhost:8080';
    const basePath = url.startsWith('/') ? url : '/' + url;
    return backendUrl + basePath + '?v=' + this.timestamp();
  }

  removeImage(): void {
    this.isUploading.set(true);
    this.profileService.deleteAvatar()
      .pipe(finalize(() => {
        this.isUploading.set(false);
      }))
      .subscribe({
        next: () => {
          this.successMessage.set('Profile picture removed.');
          this.selectedImageFile = null;
          this.imagePreviewUrl = null;
          const p = this.profile();
          if (p) {
            this.profile.update(current => ({ ...current!, profilePictureUrl: undefined }));
          }
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to remove profile picture.');
          console.error('Error removing avatar:', err);
        }
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.profileService.updateMyProfile(this.profileForm.value)
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.successMessage.set('Profile updated successfully!');
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to update profile. Please verify your inputs.');
          console.error('Error updating profile:', err);
        }
      });
  }

  cancelChanges(): void {
    const p = this.profile();
    if (p) {
      this.profileForm.patchValue({
        bio: p.bio || '',
        location: p.location || '',
        lifestylePreferences: p.lifestylePreferences || ''
      });
      this.profileForm.markAsPristine();
    }
  }

  profileCompletion = computed(() => {
    const p = this.profile();
    if (!p) return 0;
    let completedFields = 0;
    const totalFields = 4;

    if (p.bio && p.bio.trim().length > 0) completedFields++;
    if (p.location && p.location.trim().length > 0) completedFields++;
    if (p.profilePictureUrl && p.profilePictureUrl.trim().length > 0) completedFields++;
    if (p.lifestylePreferences && p.lifestylePreferences.trim().length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  });

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  get locationLength(): number {
    return this.profileForm.get('location')?.value?.length || 0;
  }

  missingFields = computed(() => {
    const missing = [];
    const p = this.profile();
    if (!p?.profilePictureUrl) missing.push('Profile Picture');
    if (!p?.bio) missing.push('Bio');
    if (!p?.location) missing.push('Location');
    if (!p?.lifestylePreferences) missing.push('Lifestyle Preferences');
    return missing;
  });

  togglePref(index: number, type: 'inApp' | 'email'): void {
    const prefs = [...this.notificationPrefs()];
    const pref = prefs[index];
    if (type === 'inApp') {
      pref.inAppEnabled = !pref.inAppEnabled;
    } else {
      pref.emailEnabled = !pref.emailEnabled;
    }
    this.notificationPrefs.set(prefs);
  }

  savePreferences(): void {
    this.isSavingPrefs.set(true);
    this.prefSuccessMessage.set('');
    this.prefErrorMessage.set('');

    const updates = this.notificationPrefs().map(pref => this.notificationService.updatePreference(pref));
    forkJoin(updates)
      .pipe(finalize(() => {
        this.isSavingPrefs.set(false);
      }))
      .subscribe({
        next: () => {
          this.prefSuccessMessage.set('Notification preferences updated.');
          setTimeout(() => { this.prefSuccessMessage.set(''); }, 3000);
        },
        error: (err) => {
          this.prefErrorMessage.set('Failed to update preferences.');
          console.error(err);
        }
      });
  }

  getPrefLabel(eventType: string): string {
    switch(eventType) {
      case 'BADGE_EARNED': return 'Badge achievements';
      case 'CHALLENGE_COMPLETED': return 'Challenge completion';
      case 'GOAL_ACHIEVED': return 'Goal completion';
      case 'LEVEL_UP': return 'Level up';
      case 'STREAK_MILESTONE': return 'Streak milestones';
      default: return eventType;
    }
  }

  getLevelProgress = computed(() => {
    const gp = this.gamificationProfile();
    if (!gp) return 0;
    const currentXp = gp.lifetimeEcoXp;
    const currentLevelThreshold = gp.currentLevelBaseXp || 0;
    const nextLevelThreshold = gp.nextLevelXp;

    if (nextLevelThreshold <= currentLevelThreshold) return 100;

    const progress = ((currentXp - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  });

  getXpToNextLevel = computed(() => {
    const gp = this.gamificationProfile();
    if (!gp) return 0;
    return Math.max(gp.nextLevelXp - gp.lifetimeEcoXp, 0);
  });

  getBadgeClass(rarity: string): string {
    switch (rarity) {
      case 'COMMON': return 'bg-orange-light text-orange';
      case 'RARE': return 'bg-slate-200 text-slate-700';
      case 'EPIC': return 'bg-yellow-light text-yellow-600';
      case 'LEGENDARY': return 'bg-cyan-light text-cyan-600';
      default: return 'bg-light text-secondary';
    }
  }

  formatSourceType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
