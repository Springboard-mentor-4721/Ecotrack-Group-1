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
      category: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required]],
      rarity: ['', [Validators.required, Validators.maxLength(20)]],
      isHidden: [false],
      isRepeatable: [false],
      criteriaType: ['', [Validators.required, Validators.maxLength(50)]],
      criteriaThreshold: [1, [Validators.required, Validators.min(1)]]
    });
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

  loadBadges(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAdminBadges(page, this.pageSize)
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
    this.badgeForm.reset({ isHidden: false, isRepeatable: false, criteriaThreshold: 1 });
    this.badgeModal.show();
  }

  openEditModal(badge: AdminBadge): void {
    this.isEditing = true;
    this.currentBadgeId = badge.id;
    
    this.badgeForm.patchValue({
      name: badge.name,
      category: badge.category,
      description: badge.description,
      rarity: badge.rarity,
      isHidden: badge.isHidden,
      isRepeatable: badge.isRepeatable,
      criteriaType: badge.criteriaType,
      criteriaThreshold: badge.criteriaThreshold
    });
    
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
      case 'BRONZE': return 'badge bg-warning text-dark opacity-75';
      case 'SILVER': return 'badge bg-secondary';
      case 'GOLD': return 'badge bg-warning text-dark';
      case 'PLATINUM': return 'badge bg-info text-dark';
      default: return 'badge bg-light text-dark';
    }
  }
}
