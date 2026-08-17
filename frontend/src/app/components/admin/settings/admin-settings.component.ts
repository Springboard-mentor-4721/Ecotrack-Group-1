import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { UserProfileResponse } from '../../../models/profile.models';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSkeletonComponent, ImageCropperComponent],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  profileForm: FormGroup;
  profile = signal<UserProfileResponse | null>(null);

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

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
    private profileService: ProfileService
  ) {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(150)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);

    this.profileService.getMyProfile().pipe(finalize(() => {
      this.isLoading.set(false);
    })).subscribe({
      next: (profile) => {
        this.profile.set(profile);

        this.profileForm.patchValue({
          bio: this.profile()?.bio || '',
          location: this.profile()?.location || ''
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
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage.set('Invalid file format. Only JPG, JPEG, PNG, WEBP are allowed.');
      return;
    }
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

  imageLoaded(): void {}
  cropperReady(): void {}
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
    this.imagePreviewUrl = this.croppedImage;

    this.profileService.uploadAvatar(this.selectedImageFile).subscribe({
      next: (response: any) => {
        this.isUploading.set(false);
        this.successMessage.set('Profile picture updated successfully!');
        if (this.profile()) {
          this.profile()!.profilePictureUrl = response.imageUrl;
        }
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err: any) => {
        this.isUploading.set(false);
        this.imagePreviewUrl = null;
        this.errorMessage.set('Failed to upload image.');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  confirmRemove(): void {
    this.showDeleteConfirm = true;
  }

  cancelRemove(): void {
    this.showDeleteConfirm = false;
  }

  removeImage(): void {
    this.profileService.deleteAvatar().subscribe({
      next: () => {
        this.successMessage.set('Profile picture removed successfully!');
        if (this.profile()) {
          this.profile()!.profilePictureUrl = undefined;
        }
        this.imagePreviewUrl = null;
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err: any) => {
        this.errorMessage.set('Failed to remove image.');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  resolveImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.apiUrl}${url}`;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    const formValues = this.profileForm.value;
    
    // Admins don't need lifestylePreferences, but it's part of UpdateUserProfileRequest DTO, so we send the existing one
    const updateRequest = {
      bio: formValues.bio,
      location: formValues.location,
      lifestylePreferences: this.profile()?.lifestylePreferences || ''
    };

    this.profileService.updateMyProfile(updateRequest).subscribe({
      next: (updatedProfile: UserProfileResponse) => {
        this.profile.set(updatedProfile);
        this.profileForm.reset({
          bio: updatedProfile.bio || '',
          location: updatedProfile.location || ''
        });
        this.isLoading.set(false);
        this.successMessage.set('Account settings updated successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to update account settings.');
        console.error('Error updating profile:', err);
      }
    });
  }

  cancelChanges(): void {
    this.profileForm.patchValue({
      bio: this.profile()?.bio || '',
      location: this.profile()?.location || ''
    });
    this.profileForm.markAsPristine();
  }

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  get locationLength(): number {
    return this.profileForm.get('location')?.value?.length || 0;
  }
}
