import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { AdminBadge, BadgeDefinitionRequest } from '../../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Edit, EyeOff, Plus, Award, Target } from 'lucide-angular';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-badge-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './admin-badge-list.component.html',
  styleUrls: ['./admin-badge-list.component.css']
})
export class AdminBadgeListComponent implements OnInit {
  badges: AdminBadge[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Tabs
  activeTab: 'GENERIC' | 'CHALLENGE' = 'GENERIC';

  // Icons
  EditIcon = Edit;
  DisableIcon = EyeOff;
  PlusIcon = Plus;
  AwardIcon = Award;
  TargetIcon = Target;

  // Modal and Form
  badgeForm: FormGroup;
  isEditing = false;
  currentBadgeId: number | null = null;
  badgeModal: any;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.badgeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['GENERIC', [Validators.required]],
      category: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required]],
      rarity: [''], // Rarity is not required globally anymore since CHALLENGE badges don't need it
      icon: [''],
      color: [''],
      isHidden: [false],
      isRepeatable: [false],
      criteriaType: [''],
      criteriaThreshold: [1]
    });
    
    // Listen for type changes to update validators
    this.badgeForm.get('type')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }
  
  private updateValidators(type: string): void {
    const criteriaTypeControl = this.badgeForm.get('criteriaType');
    const criteriaThresholdControl = this.badgeForm.get('criteriaThreshold');
    const rarityControl = this.badgeForm.get('rarity');
    
    if (type === 'GENERIC') {
      criteriaTypeControl?.setValidators([Validators.required, Validators.maxLength(50)]);
      criteriaThresholdControl?.setValidators([Validators.required, Validators.min(1)]);
      rarityControl?.setValidators([Validators.required, Validators.maxLength(20)]);
    } else {
      criteriaTypeControl?.clearValidators();
      criteriaThresholdControl?.clearValidators();
      rarityControl?.clearValidators();
      criteriaTypeControl?.setValue('');
      criteriaThresholdControl?.setValue(null);
      rarityControl?.setValue(null);
    }
    
    criteriaTypeControl?.updateValueAndValidity();
    criteriaThresholdControl?.updateValueAndValidity();
    rarityControl?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.loadBadges(this.currentPage);
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('badgeModal');
    if (modalElement) {
      this.badgeModal = new bootstrap.Modal(modalElement);
    }
  }

  setTab(tab: 'GENERIC' | 'CHALLENGE'): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.loadBadges(this.currentPage);
  }

  loadBadges(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAdminBadges(page, this.pageSize, this.activeTab)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.badges = response.content;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load badges.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadBadges(newPage);
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentBadgeId = null;
    this.badgeForm.reset({ type: this.activeTab, isHidden: false, isRepeatable: false, criteriaThreshold: 1 });
    this.updateValidators(this.activeTab);
    this.badgeModal.show();
  }

  openEditModal(badge: AdminBadge): void {
    this.isEditing = true;
    this.currentBadgeId = badge.id;
    
    this.badgeForm.patchValue({
      name: badge.name,
      type: badge.type,
      category: badge.category,
      description: badge.description,
      rarity: badge.rarity,
      icon: badge.icon,
      color: badge.color,
      isHidden: badge.isHidden,
      isRepeatable: badge.isRepeatable,
      criteriaType: badge.criteriaType,
      criteriaThreshold: badge.criteriaThreshold
    });
    this.updateValidators(badge.type);
    
    this.badgeModal.show();
  }

  closeModal(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.badgeModal.hide();
  }

  saveBadge(): void {
    if (this.badgeForm.invalid) {
      this.badgeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    const request: BadgeDefinitionRequest = this.badgeForm.value;

    const saveObs = this.isEditing && this.currentBadgeId
      ? this.adminService.updateBadge(this.currentBadgeId, request)
      : this.adminService.createBadge(request);

    saveObs.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        this.successMessage = `Badge successfully ${this.isEditing ? 'updated' : 'created'}.`;
        this.closeModal();
        this.loadBadges(this.currentPage);
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving badge:', err);
        this.errorMessage = 'Failed to save badge. Please check your inputs.';
        this.cdr.detectChanges();
      }
    });
  }

  disableBadge(id: number): void {
    if (confirm('Are you sure you want to disable this badge? Users will no longer be able to earn it.')) {
      this.adminService.disableBadge(id).subscribe({
        next: () => {
          this.successMessage = 'Badge successfully disabled.';
          this.cdr.detectChanges();
          this.loadBadges(this.currentPage);
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Error disabling badge:', err);
          this.errorMessage = 'Failed to disable badge.';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
      });
    }
  }

  getRarityClass(rarity: string): string {
    switch (rarity) {
      case 'COMMON': return 'badge bg-warning text-dark opacity-75';
      case 'RARE': return 'badge bg-secondary';
      case 'EPIC': return 'badge bg-warning text-dark';
      case 'LEGENDARY': return 'badge bg-info text-dark';
      default: return 'badge bg-light text-dark';
    }
  }
}
