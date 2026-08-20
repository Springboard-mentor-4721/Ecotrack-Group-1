import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { AdminBadge, BadgeDefinitionRequest } from '../../../../models/admin.models';
import { finalize } from 'rxjs/operators';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';

import { LucideAngularModule, Edit, EyeOff, Eye, Plus, Award, Target } from 'lucide-angular';

import { BadgeEmblemComponent } from '../../../../shared/components/badge-emblem/badge-emblem.component';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-badge-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, BadgeEmblemComponent],
  templateUrl: './admin-badge-list.component.html',
  styleUrls: ['./admin-badge-list.component.css']
})
export class AdminBadgeListComponent implements OnInit {
  badges = signal<AdminBadge[]>([]);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);

  // Tabs
  activeTab = signal<'GENERIC' | 'CHALLENGE'>('GENERIC');

  // Icons
  EditIcon = Edit;
  DisableIcon = EyeOff;
  EnableIcon = Eye;
  PlusIcon = Plus;
  AwardIcon = Award;
  TargetIcon = Target;

  // Modal and Form
  badgeForm: FormGroup;
  isEditing = signal<boolean>(false);
  currentBadgeId = signal<number | null>(null);
  badgeModal: any;

  // Dropdown Configs
  badgeTypes = [
    { value: 'GENERIC', label: 'Generic Achievement' },
    { value: 'CHALLENGE', label: 'Challenge Badge' }
  ];
  categories = [
    { value: 'TRACKING', label: 'Tracking' },
    { value: 'GOALS', label: 'Goals' },
    { value: 'ENGAGEMENT', label: 'Engagement' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Food', label: 'Food' },
    { value: 'Waste', label: 'Waste' },
    { value: 'Community', label: 'Community' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Water', label: 'Water' }
  ];
  rarities = [
    { value: 'COMMON', label: 'Common' },
    { value: 'RARE', label: 'Rare' },
    { value: 'EPIC', label: 'Epic' },
    { value: 'LEGENDARY', label: 'Legendary' }
  ];
  criteriaTypes = [
    { value: 'CARBON_ENTRIES_COUNT', label: 'Carbon Entries Count' },
    { value: 'GOAL_COMPLETED_COUNT', label: 'Goals Completed' },
    { value: 'STREAK_DAYS', label: 'Consecutive Streak Days' },
    { value: 'CHALLENGE_COMPLETED_COUNT', label: 'Challenges Completed' },
    { value: 'CATEGORY_SPECIALIST', label: 'Category Specialist' }
  ];
  colors = [
    { value: 'blue', label: 'Blue' },
    { value: 'teal', label: 'Teal' },
    { value: 'green', label: 'Green' },
    { value: 'emerald', label: 'Emerald' },
    { value: 'amber', label: 'Amber' },
    { value: 'orange', label: 'Orange' },
    { value: 'violet', label: 'Violet' }
  ];

  getOptionLabel(options: any[], value: string, placeholder: string): string {
    const opt = options.find(o => o.value === value);
    return opt ? opt.label : placeholder;
  }

  setFormValue(field: string, value: string): void {
    this.badgeForm.get(field)?.setValue(value);
    this.badgeForm.get(field)?.markAsTouched();
  }

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private dialog: ConfirmationDialogService
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
    this.loadBadges(this.currentPage());
  }

  formatEnumStr(val: string | undefined): string {
    if (!val) return '';
    return val.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('badgeModal');
    if (modalElement) {
      this.badgeModal = new bootstrap.Modal(modalElement);
    }
  }

  setTab(tab: 'GENERIC' | 'CHALLENGE'): void {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.loadBadges(0);
  }

  loadBadges(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.adminService.getAdminBadges(page, this.pageSize(), this.activeTab())
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (response) => {
          this.badges.set(response.content);
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (err) => {
          this.errorMessage.set('Failed to load badges.');
          console.error(err);
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.loadBadges(newPage);
    }
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentBadgeId.set(null);
    this.badgeForm.reset({ type: this.activeTab(), isHidden: false, isRepeatable: false, criteriaThreshold: 1 });
    this.updateValidators(this.activeTab());
    this.badgeModal.show();
  }

  openEditModal(badge: AdminBadge): void {
    this.isEditing.set(true);
    this.currentBadgeId.set(badge.id);
    
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

    this.isSaving.set(true);
    this.errorMessage.set('');
    
    const request: BadgeDefinitionRequest = this.badgeForm.value;

    const saveObs = this.isEditing() && this.currentBadgeId()
      ? this.adminService.updateBadge(this.currentBadgeId()!, request)
      : this.adminService.createBadge(request);

    saveObs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.successMessage.set(`Badge successfully ${this.isEditing() ? 'updated' : 'created'}.`);
        this.closeModal();
        this.loadBadges(this.currentPage());
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving badge:', err);
        this.errorMessage.set('Failed to save badge. Please check your inputs.');
      }
    });
  }

  disableBadge(id: number): void {
    this.dialog.confirm('Are you sure you want to disable this badge? Users will no longer be able to earn it.').then((res) => {
      if (res) {
        this.adminService.disableBadge(id).subscribe({
          next: () => {
            this.successMessage.set('Badge successfully disabled.');
            this.loadBadges(this.currentPage());
            setTimeout(() => {
              this.successMessage.set('');
            }, 3000);
          },
          error: (err) => {
            console.error('Error disabling badge:', err);
            this.errorMessage.set('Failed to disable badge.');
            setTimeout(() => {
              this.errorMessage.set('');
            }, 3000);
          }
        });
      }
    });
  }

  enableBadge(id: number): void {
    this.dialog.confirm('Are you sure you want to enable this badge? It will become visible to users again.').then((res) => {
      if (res) {
        this.adminService.enableBadge(id).subscribe({
          next: () => {
            this.successMessage.set('Badge successfully enabled.');
            this.loadBadges(this.currentPage());
            setTimeout(() => {
              this.successMessage.set('');
            }, 3000);
          },
          error: (err) => {
            console.error('Error enabling badge:', err);
            this.errorMessage.set('Failed to enable badge.');
            setTimeout(() => {
              this.errorMessage.set('');
            }, 3000);
          }
        });
      }
    });
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
