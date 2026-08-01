import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { CampaignPreview } from '../../components/campaign-preview/campaign-preview';
import { RuleBuilder } from '../../components/rule-builder/rule-builder';
import { TemplateGallery } from '../../components/template-gallery/template-gallery';
import { ChallengeConfig } from '../../components/challenge-config/challenge-config';

import { ChallengeTemplate } from '../../models/challenge-ui.models';
import { CHALLENGE_TEMPLATES } from '../../admin-challenge-list/challenge-templates.config';
import { CarbonEntryService } from '../../../../../services/carbon-entry.service';
import { AdminService } from '../../../../../services/admin.service';
import { ChallengeService } from '../../../../../services/challenge.service';
import { ChallengeRequest } from '../../../../../models/challenge.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-challenge-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CampaignPreview, RuleBuilder, TemplateGallery, ChallengeConfig],
  providers: [DatePipe],
  templateUrl: './challenge-create.html',
  styleUrl: './challenge-create.css'
})
export class ChallengeCreate implements OnInit {
  // State Ownership
  selectedTemplate: ChallengeTemplate | null = null;
  challengeForm!: FormGroup;
  categories: any[] = [];
  availableSubcategories: any[] = [];
  allowedSubcategories: string[] = [];
  blockedSubcategories: string[] = [];
  
  // Internal workflow & loading state
  workflowState: 'GALLERY' | 'CONFIG' = 'GALLERY';
  isEditing = false;
  currentChallengeId: number | null = null;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  templates: ChallengeTemplate[] = CHALLENGE_TEMPLATES.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    sustainabilityGroup: (t.sustainabilityGroup as any) || 'General',
    trackingMethod: t.trackingMethod,
    progressType: t.progressType,
    difficulty: t.difficulty,
    durationDays: t.durationDays,
    rewardXp: t.recommendedXP,
    targetValue: t.target,
    linkedCategoryName: t.linkedCategoryName || undefined,
    defaultAllowedActivities: t.defaultAllowedActivities || [],
    defaultIgnoredActivities: t.defaultIgnoredActivities || [],
    editableFields: t.editableFields
  }));

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private carbonService: CarbonEntryService,
    private adminService: AdminService,
    private challengeService: ChallengeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.rebuildForm();
  }

  ngOnInit() {
    this.loadCategories();

    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.isEditing = true;
      this.currentChallengeId = Number(idParam);
      this.workflowState = 'CONFIG'; 
      this.loadChallengeForEdit(this.currentChallengeId);
    }
  }

  get supportsRules(): boolean {
    return this.selectedTemplate?.trackingMethod === 'AUTOMATIC' || this.selectedTemplate?.trackingMethod === 'HYBRID';
  }

  get supportsInstructions(): boolean {
    return this.selectedTemplate?.trackingMethod === 'MANUAL' || this.selectedTemplate?.trackingMethod === 'HYBRID';
  }

  loadCategories(): void {
    this.carbonService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load categories', err)
    });
  }

  loadChallengeForEdit(id: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.challengeService.getChallengeDetail(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (challenge) => {
          // Attempt to map challenge back to a template if possible, or just build an ad-hoc template
          // For edit mode, we bypass the gallery so we just need to satisfy the configuration step.
          this.selectedTemplate = this.templates.find(t => 
            t.trackingMethod === challenge.trackingMethod && 
            t.progressType === challenge.progressType
          ) || this.templates[0]; // Fallback to first if not exactly matched

          this.rebuildForm();
          
          const start = this.datePipe.transform(challenge.startDate, 'yyyy-MM-dd');
          const end = this.datePipe.transform(challenge.endDate, 'yyyy-MM-dd');

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

          if (this.supportsRules) {
            this.loadSubcategories(challenge.linkedCategoryId || null);
            this.allowedSubcategories = challenge.rulesConfig?.allowedSubcategories?.map(id => this.getSubcategoryName(id)) || [];
            this.blockedSubcategories = challenge.rulesConfig?.blockedSubcategories?.map(id => this.getSubcategoryName(id)) || [];
            this.syncRuleControls();
          }

          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load challenge for edit.';
          console.error(err);
        }
      });
  }

  getSubcategoryName(id: number): string {
    const sub = this.availableSubcategories.find(s => s.id === id);
    return sub ? sub.name : `Subcategory ${id}`;
  }

  // Gallery Selection
  onTemplateSelected(template: ChallengeTemplate): void {
    this.selectedTemplate = template;
    this.workflowState = 'CONFIG';
    this.rebuildForm();
    this.cdr.markForCheck();
  }

  cancelCreation(): void {
    this.router.navigate(['/admin/challenges-new']);
  }

  saveCampaign(): void {
    if (this.challengeForm.invalid) {
      this.challengeForm.markAllAsTouched();
      this.errorMessage = 'Please fix the errors in the form before saving.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const request: ChallengeRequest = this.challengeForm.value;
    
    // Format dates to ISO
    if (request.startDate && request.startDate.length === 10) request.startDate += 'T00:00:00';
    if (request.endDate && request.endDate.length === 10) request.endDate += 'T23:59:59';
    if (request.startDate && request.startDate.length === 16) request.startDate += ':00';
    if (request.endDate && request.endDate.length === 16) request.endDate += ':00';

    request.trackingMethod = this.selectedTemplate?.trackingMethod || 'MANUAL';
    
    if (this.supportsRules) {
      // Map back to IDs
      const allowedIds = this.allowedSubcategories.map(name => this.availableSubcategories.find(s => s.name === name)?.id).filter(id => !!id);
      const blockedIds = this.blockedSubcategories.map(name => this.availableSubcategories.find(s => s.name === name)?.id).filter(id => !!id);
      
      request.rulesConfig = {
        allowedSubcategories: allowedIds,
        blockedSubcategories: blockedIds
      };
    } else {
      request.rulesConfig = null;
    }

    const saveObs = this.isEditing && this.currentChallengeId
      ? this.adminService.updateChallenge(this.currentChallengeId, request)
      : this.adminService.createChallenge(request);

    saveObs.pipe(finalize(() => {
      this.isSaving = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.successMessage = `Challenge successfully ${this.isEditing ? 'updated' : 'created'}!`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/admin/challenges-new']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error saving challenge:', err);
        this.errorMessage = 'Failed to save challenge. Please check your inputs.';
        this.cdr.markForCheck();
      }
    });
  }

  resolveCategory(categoryName: string | null | undefined): any {
    if (!categoryName) return null;
    return this.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase()) || null;
  }

  isFieldEditable(fieldName: string): boolean {
    if (!this.selectedTemplate) return true;
    return this.selectedTemplate.editableFields.includes(fieldName);
  }

  rebuildForm(): void {
    const isEditable = (field: string) => this.isFieldEditable(field);
    const tpl = this.selectedTemplate;
    
    this.challengeForm = this.fb.group({
      title: [tpl ? tpl.title : '', isEditable('title') ? [Validators.required, Validators.maxLength(100)] : []],
      description: [tpl ? tpl.description : '', isEditable('description') ? [Validators.required] : []],
      typeCode: ['COMMUNITY', isEditable('typeCode') ? [Validators.required] : []],
      targetValue: [tpl ? tpl.targetValue : 1, isEditable('target') ? [Validators.required, Validators.min(1)] : []],
      startDate: ['', isEditable('startDate') ? [Validators.required] : []],
      endDate: ['', isEditable('endDate') ? [Validators.required] : []],
      linkedCategoryId: [tpl ? (this.resolveCategory(tpl.linkedCategoryName)?.id || null) : null],
      progressType: [tpl ? tpl.progressType : 'COUNT', isEditable('progressType') ? [Validators.required] : []],
      rewardXp: [tpl ? tpl.rewardXp : 500, isEditable('recommendedXP') ? [Validators.required, Validators.min(1)] : []],
      instructions: [tpl ? '' : '', isEditable('defaultInstructions') ? [Validators.required] : []]
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

    this.challengeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  loadSubcategories(categoryId: number | null): void {
    this.availableSubcategories = [];
    if (!categoryId) return;
    const cat = this.categories.find(c => c.id === categoryId);
    if (cat && cat.subCategories) {
      this.availableSubcategories = cat.subCategories;
    }
  }

  onCategoryChanged(categoryId: number | null): void {
    this.clearRules();
    this.loadSubcategories(categoryId);
    this.challengeForm.patchValue({ linkedCategoryId: categoryId });
    this.cdr.markForCheck();
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
  }

  onAllowedRulesChanged(allowed: string[]): void {
    this.allowedSubcategories = allowed;
    this.syncRuleControls();
    this.cdr.markForCheck();
  }

  onBlockedRulesChanged(blocked: string[]): void {
    this.blockedSubcategories = blocked;
    this.syncRuleControls();
    this.cdr.markForCheck();
  }
}
