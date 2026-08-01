import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { Challenge, ChallengeRequest } from '../../../../models/challenge.models';
import { CarbonEntryService } from '../../../../services/carbon-entry.service';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule, Edit, Play, Pause, Trash2, Plus, Calendar, Target, List, X } from 'lucide-angular';
import { CHALLENGE_TEMPLATES, ChallengeTemplate } from './challenge-templates.config';

export type WorkflowStep = 'SELECTION' | 'REVIEW' | 'CONFIGURE' | 'PUBLISH';

export interface CampaignPreview {
  title: string;
  description: string;
  durationDays: number;
  rewardXP: number;
  trackingStyle: string;
  categoryName: string | null;
  allowedActivities: string[];
  ignoredActivities: string[];
  instructions: string | null;
  difficulty: string;
  progressMeasurement: string;
  completionTarget: number;
}
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
  challengeForm!: FormGroup;
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

  // Workflow State
  currentStep: WorkflowStep = 'SELECTION';
  selectedTemplate: ChallengeTemplate | null = null;

  get currentTrackingLabel(): string {
    return this.selectedTemplate?.trackingMethod || 'UNKNOWN';
  }

  get currentSustainabilityGroup(): string {
    return this.selectedTemplate?.sustainabilityGroup || 'UNKNOWN';
  }

  get currentDuration(): number {
    return this.selectedTemplate?.durationDays || 0;
  }

  get currentDifficulty(): string {
    return this.selectedTemplate?.difficulty || 'UNKNOWN';
  }

  get currentXP(): number {
    return this.selectedTemplate?.recommendedXP || 0;
  }

  get previewState(): CampaignPreview | null {
    if (!this.selectedTemplate) return null;
    return {
      title: this.selectedTemplate.title,
      description: this.selectedTemplate.description,
      durationDays: this.selectedTemplate.durationDays,
      rewardXP: this.selectedTemplate.recommendedXP,
      trackingStyle: this.selectedTemplate.trackingMethod,
      categoryName: this.selectedTemplate.linkedCategoryName,
      allowedActivities: this.selectedTemplate.defaultAllowedActivities || [],
      ignoredActivities: this.selectedTemplate.defaultIgnoredActivities || [],
      instructions: this.selectedTemplate.defaultInstructions,
      difficulty: this.selectedTemplate.difficulty,
      progressMeasurement: this.selectedTemplate.progressType,
      completionTarget: this.selectedTemplate.target
    };
  }

  get validationState(): any {
    // Determine if we can proceed to publish based on config
    return {
      canProceedToReview: !!this.selectedTemplate,
      canPublish: this.currentStep === 'PUBLISH' && this.challengeForm.valid,
      missingConfig: []
    };
  }

  isFieldEditable(fieldName: string): boolean {
    if (!this.selectedTemplate) return true;
    return this.selectedTemplate.editableFields.includes(fieldName);
  }







  // --- Rule Builder Logic ---
  availableSubcategories: any[] = [];
  allowedSubcategories: string[] = [];
  blockedSubcategories: string[] = [];

  loadSubcategories(categoryId: number | null): void {
    this.availableSubcategories = [];
    if (!categoryId) return;
    const cat = this.categories.find(c => c.id === categoryId);
    if (cat && cat.subCategories) {
      this.availableSubcategories = cat.subCategories;
    }
  }

  onCategoryChange(event: any): void {
    const categoryId = event.target.value ? Number(event.target.value) : null;
    this.clearRules();
    this.loadSubcategories(categoryId);
    this.challengeForm.patchValue({ linkedCategoryId: categoryId });
  }

  selectAllowed(subName: string): void {
    if (!this.allowedSubcategories.includes(subName)) {
      this.allowedSubcategories.push(subName);
    }
    this.removeBlocked(subName, false);
    this.syncRuleControls();
  }

  selectBlocked(subName: string): void {
    if (!this.blockedSubcategories.includes(subName)) {
      this.blockedSubcategories.push(subName);
    }
    this.removeAllowed(subName, false);
    this.syncRuleControls();
  }

  removeAllowed(subName: string, sync: boolean = true): void {
    this.allowedSubcategories = this.allowedSubcategories.filter(s => s !== subName);
    if (sync) this.syncRuleControls();
  }

  removeBlocked(subName: string, sync: boolean = true): void {
    this.blockedSubcategories = this.blockedSubcategories.filter(s => s !== subName);
    if (sync) this.syncRuleControls();
  }

  clearRules(): void {
    this.allowedSubcategories = [];
    this.blockedSubcategories = [];
    this.syncRuleControls();
  }

  syncRuleControls(): void {
    this.allowedSubcategories = [...new Set(this.allowedSubcategories)];
    this.blockedSubcategories = [...new Set(this.blockedSubcategories)];
    this.allowedSubcategories = this.allowedSubcategories.filter(s => !this.blockedSubcategories.includes(s));

    if (this.challengeForm) {
      this.challengeForm.patchValue({
        allowedSubcategories: this.allowedSubcategories,
        blockedSubcategories: this.blockedSubcategories
      });
    }
  }

  // --- Workflow Navigation Helpers ---
  canGoNext(): boolean {
    if (this.currentStep === 'SELECTION') {
      return this.selectedTemplate !== null;
    }
    if (this.currentStep === 'REVIEW') {
      return this.selectedTemplate !== null;
    }
    if (this.currentStep === 'CONFIGURE') {
      return this.challengeForm.valid;
    }
    return false;
  }

  canGoPrevious(): boolean {
    // If we are editing, we cannot go back to selection or review.
    if (this.isEditing) {
      return false;
    }
    return this.currentStep !== 'SELECTION';
  }

  canPublish(): boolean {
    return this.currentStep === 'PUBLISH' && this.challengeForm.valid;
  }

  cancelWorkflow(): void {
    this.resetWorkflow();
    this.closeModal();
  }

  resetWorkflow(): void {
    this.isEditing = false;
    this.currentChallengeId = null;
    this.selectedTemplate = null;
    this.currentStep = 'SELECTION';
    this.rebuildForm();
  }

  goToNextStep(): void {
    if (!this.canGoNext()) return;
    
    switch(this.currentStep) {
      case 'SELECTION': this.currentStep = 'REVIEW'; break;
      case 'REVIEW': 
        this.currentStep = 'CONFIGURE'; 
        break;
      case 'CONFIGURE': this.currentStep = 'PUBLISH'; break;
    }
  }

  goToPreviousStep(): void {
    if (!this.canGoPrevious()) return;
    
    switch(this.currentStep) {
      case 'PUBLISH': this.currentStep = 'CONFIGURE'; break;
      case 'CONFIGURE': this.currentStep = 'REVIEW'; break;
      case 'REVIEW': this.currentStep = 'SELECTION'; break;
    }
  }
  selectTemplate(templateId: string): void {
    const tpl = this.templates.find(t => t.id === templateId);
    if (tpl) {
      this.selectedTemplate = tpl;
    }
  }

  private syncStateToForm(): void {
    this.rebuildForm();
  }
  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private carbonService: CarbonEntryService,
    private cdr: ChangeDetectorRef
  ) {
    this.rebuildForm();
  }

  // --- Tracking Capabilities Computed from State ---
  get hasAutomaticTracking(): boolean {
    return this.selectedTemplate?.trackingMethod === 'AUTOMATIC' || this.selectedTemplate?.trackingMethod === 'HYBRID';
  }

  get hasManualTracking(): boolean {
    return this.selectedTemplate?.trackingMethod === 'MANUAL' || this.selectedTemplate?.trackingMethod === 'HYBRID';
  }

  get supportsRules(): boolean {
    return this.hasAutomaticTracking;
  }

  get supportsCategory(): boolean {
    return this.hasAutomaticTracking;
  }

  get supportsInstructions(): boolean {
    return this.hasManualTracking;
  }

  resolveCategory(categoryName: string | null): any {
    if (!categoryName) return null;
    return this.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase()) || null;
  }

  rebuildForm(): void {
    const isEditable = (field: string) => this.isFieldEditable(field);
    const tpl = this.selectedTemplate;
    
    // We create all controls to satisfy the current static HTML template, 
    // but dynamically apply validators based on editableFields configuration.
    
    this.challengeForm = this.fb.group({
      title: [tpl ? tpl.title : '', isEditable('title') ? [Validators.required, Validators.maxLength(100)] : []],
      description: [tpl ? tpl.description : '', isEditable('description') ? [Validators.required] : []],
      typeCode: ['COMMUNITY', isEditable('typeCode') ? [Validators.required] : []],
      targetValue: [tpl ? tpl.target : 1, isEditable('target') ? [Validators.required, Validators.min(1)] : []],
      startDate: ['', isEditable('startDate') ? [Validators.required] : []],
      endDate: ['', isEditable('endDate') ? [Validators.required] : []],
      linkedCategoryId: [tpl ? (this.resolveCategory(tpl.linkedCategoryName)?.id || null) : null],
      progressType: [tpl ? tpl.progressType : 'COUNT', isEditable('progressType') ? [Validators.required] : []],
      rewardXp: [tpl ? tpl.recommendedXP : 500, isEditable('recommendedXP') ? [Validators.required, Validators.min(1)] : []],
      
      // Placeholders for future rule configuration (Commit 5/6)
      instructions: [tpl ? tpl.defaultInstructions : '', isEditable('defaultInstructions') ? [Validators.required] : []],
      allowedSubcategories: [[]],
      blockedSubcategories: [[]]
    });

    if (this.supportsRules) {
      const catId = tpl ? (this.resolveCategory(tpl.linkedCategoryName)?.id || null) : null;
      this.loadSubcategories(catId);
      this.allowedSubcategories = tpl && tpl.defaultAllowedActivities ? [...tpl.defaultAllowedActivities] : [];
      this.blockedSubcategories = tpl && tpl.defaultIgnoredActivities ? [...tpl.defaultIgnoredActivities] : [];
      this.syncRuleControls();
    } else {
      this.clearRules();
    }
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
      next: (res: any) => {
        this.categories = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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
        error: (err: any) => {
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
    this.resetWorkflow();
    this.challengeModal.show();
  }

  openEditModal(challenge: Challenge): void {
    this.resetWorkflow(); // start clean
    this.isEditing = true;
    this.currentChallengeId = challenge.id;
    
    // When editing, directly enter CONFIGURE state since it already exists.
    this.currentStep = 'CONFIGURE';
    
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const start = this.datePipe.transform(challenge.startDate, 'yyyy-MM-ddTHH:mm');
    const end = this.datePipe.transform(challenge.endDate, 'yyyy-MM-ddTHH:mm');

    // Make sure we have a form to patch into
    this.rebuildForm();
    
    this.challengeForm.patchValue({
      title: challenge.title,
      description: challenge.description,
      typeCode: challenge.typeCode || 'COMMUNITY',
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
    this.resetWorkflow();
    this.challengeModal.hide();
  }

  onTemplateChange(event: any): void {
    const templateId = event.target.value;
    if (!templateId) {
      this.selectedTemplate = null;
      this.rebuildForm();
      return;
    }
    
    this.selectTemplate(templateId);
    this.syncStateToForm();
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
      error: (err: any) => {
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
        error: (err: any) => {
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
        error: (err: any) => {
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
