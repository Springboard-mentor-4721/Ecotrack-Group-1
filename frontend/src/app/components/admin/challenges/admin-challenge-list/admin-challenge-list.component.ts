import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { Challenge, ChallengeRequest } from '../../../../models/challenge.models';
import { CarbonEntryService } from '../../../../services/carbon-entry.service';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Edit, Play, Pause, Trash2, Plus, Calendar, Target, List, X } from 'lucide-angular';
import { CHALLENGE_TEMPLATES } from './challenge-templates.config';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-challenge-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './admin-challenge-list.component.html',
  styleUrls: ['./admin-challenge-list.component.css']
})
export class AdminChallengeListComponent implements OnInit {
  challenges: Challenge[] = [];
  categories: any[] = [];
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
  PlayIcon = Play;
  PauseIcon = Pause;
  TrashIcon = Trash2;
  PlusIcon = Plus;
  CalendarIcon = Calendar;
  TargetIcon = Target;
  ListIcon = List;
  XIcon = X;

  // Modal and Form
  challengeForm: FormGroup;
  isEditing = false;
  currentChallengeId: number | null = null;
  challengeModal: any;

  // Confirmation Modal
  confirmationModal: any;
  pendingActionId: number | null = null;
  pendingActionType: 'APPROVE' | 'REJECT' | 'ARCHIVE' | '' = '';
  confirmationAction: string = '';
  confirmationMessage: string = '';

  templates = CHALLENGE_TEMPLATES;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private carbonService: CarbonEntryService,
    private cdr: ChangeDetectorRef
  ) {
    this.challengeForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      typeCode: ['', [Validators.required]],
      targetValue: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      linkedCategoryId: [null],
      progressType: ['COUNT', [Validators.required]],
      rewardXp: [500, [Validators.required, Validators.min(1)]]
    });
  }

  get targetValueUnit(): string {
    return this.challengeForm?.get('progressType')?.value === 'AMOUNT' ? 'kg CO₂e' : 'Entries';
  }

  ngOnInit(): void {
    this.loadChallenges(this.currentPage);
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('challengeModal');
    if (modalElement) {
      this.challengeModal = new bootstrap.Modal(modalElement);
    }
    const confModalElement = document.getElementById('confirmationModal');
    if (confModalElement) {
      this.confirmationModal = new bootstrap.Modal(confModalElement);
    }
  }

  loadCategories(): void {
    this.carbonService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadChallenges(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAdminChallenges(page, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response: any) => {
          this.challenges = response.content;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load challenges.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadChallenges(newPage);
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentChallengeId = null;
    this.challengeForm.reset({ targetValue: 1, typeCode: 'COMMUNITY', progressType: 'COUNT', rewardXp: 500, linkedCategoryId: null });
    this.challengeModal.show();
  }

  openEditModal(challenge: Challenge): void {
    this.isEditing = true;
    this.currentChallengeId = challenge.id;
    
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const start = this.datePipe.transform(challenge.startDate, 'yyyy-MM-ddTHH:mm');
    const end = this.datePipe.transform(challenge.endDate, 'yyyy-MM-ddTHH:mm');

    this.challengeForm.patchValue({
      title: challenge.title,
      description: challenge.description,
      typeCode: challenge.typeCode,
      targetValue: challenge.targetValue,
      startDate: start,
      endDate: end,
      linkedCategoryId: challenge.linkedCategoryId || null,
      progressType: challenge.progressType || 'COUNT',
      rewardXp: challenge.rewardXp || 500
    });
    
    this.challengeModal.show();
  }

  closeModal(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.challengeModal.hide();
  }

  onTemplateChange(event: any): void {
    const templateId = event.target.value;
    if (!templateId) {
      this.challengeForm.patchValue({
        title: '',
        description: '',
        linkedCategoryId: null,
        progressType: 'COUNT',
        targetValue: 1,
        rewardXp: 500,
        typeCode: 'COMMUNITY'
      });
      return;
    }

    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      const category = this.categories.find(c => c.name.toLowerCase() === template.categoryName.toLowerCase());
      
      this.challengeForm.patchValue({
        title: template.title,
        description: template.description,
        linkedCategoryId: category ? category.categoryId : null,
        progressType: template.progressType,
        targetValue: template.targetValue,
        rewardXp: template.rewardXp,
        typeCode: template.typeCode
      });
    }
  }

  saveChallenge(): void {
    if (this.challengeForm.invalid) {
      this.challengeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    const request: ChallengeRequest = this.challengeForm.value;
    
    // Ensure correct ISO format by parsing and stringifying or just passing the datetime-local string directly 
    // Backend expects ISO LocalDateTime (e.g., '2023-10-15T10:00:00')
    if (request.startDate.length === 16) request.startDate += ':00';
    if (request.endDate.length === 16) request.endDate += ':00';

    const saveObs = this.isEditing && this.currentChallengeId
      ? this.adminService.updateChallenge(this.currentChallengeId, request)
      : this.adminService.createChallenge(request);

    saveObs.pipe(finalize(() => {
      this.isSaving = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: () => {
        this.successMessage = `Challenge successfully ${this.isEditing ? 'updated' : 'created'}.`;
        this.cdr.detectChanges();
        this.closeModal();
        this.loadChallenges(this.currentPage);
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving challenge:', err);
        this.errorMessage = 'Failed to save challenge. Please check your inputs.';
        this.cdr.detectChanges();
      }
    });
  }

  moderateChallenge(id: number, action: string): void {
    this.pendingActionId = id;
    this.pendingActionType = action as any;
    this.confirmationAction = action === 'APPROVE' ? 'activate' : 'deactivate';
    this.confirmationMessage = `Are you sure you want to ${this.confirmationAction} this challenge?`;
    this.confirmationModal.show();
  }

  archiveChallenge(id: number): void {
    this.pendingActionId = id;
    this.pendingActionType = 'ARCHIVE';
    this.confirmationAction = 'archive';
    this.confirmationMessage = 'Are you sure you want to archive this challenge? This action cannot be undone.';
    this.confirmationModal.show();
  }

  closeConfirmationModal(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.confirmationModal.hide();
    this.pendingActionId = null;
    this.pendingActionType = '';
  }

  confirmAction(): void {
    if (!this.pendingActionId || !this.pendingActionType) return;
    
    const id = this.pendingActionId;
    const type = this.pendingActionType;
    const actionName = this.confirmationAction;
    
    this.closeConfirmationModal();

    if (type === 'ARCHIVE') {
      this.adminService.archiveChallenge(id).subscribe({
        next: () => {
          this.successMessage = 'Challenge successfully archived.';
          this.cdr.detectChanges();
          this.loadChallenges(this.currentPage);
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Error archiving challenge:', err);
          this.errorMessage = 'Failed to archive challenge.';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
      });
    } else {
      this.adminService.moderateChallenge(id, type).subscribe({
        next: () => {
          this.successMessage = `Challenge successfully ${actionName}d.`;
          this.cdr.detectChanges();
          this.loadChallenges(this.currentPage);
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('Error moderating challenge:', err);
          this.errorMessage = `Failed to ${actionName} challenge.`;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'COMPLETED': return 'badge bg-info';
      case 'CLOSED': return 'badge bg-secondary';
      case 'ARCHIVED': return 'badge bg-dark';
      default: return 'badge bg-light text-dark';
    }
  }
}
