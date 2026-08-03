import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ChallengeRequest } from '../../../../../models/challenge.models';
import { CanComponentDeactivate } from '../../guards/unsaved-changes.guard';
import { CHALLENGE_TYPES } from '../../shared/challenge-types.config';
import { CarbonCategory } from '../../../../../models/carbon-category.models';

interface Template {
  id: string;
  title: string;
  desc: string;
  category: string;
  isPopular?: boolean;
  isNew?: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-challenges-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="wizard-page">
      <div class="wizard-header-top">
        <button class="back-link" (click)="cancel()">
          <span class="material-icons">arrow_back</span> Create Challenge
        </button>
      </div>

      <div class="wizard-main-container">
        
        <!-- STEPPER NAV -->
        <div class="stepper-nav">
          <div class="step" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1" (click)="goToStep(1)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 1">1</span>
              <span class="material-icons" *ngIf="currentStep() > 1">check</span>
            </div>
            <span class="step-label">Template</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 1"></div>
          
          <div class="step" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2" (click)="goToStep(2)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 2">2</span>
              <span class="material-icons" *ngIf="currentStep() > 2">check</span>
            </div>
            <span class="step-label">Basic Info</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 2"></div>
          
          <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3" (click)="goToStep(3)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 3">3</span>
              <span class="material-icons" *ngIf="currentStep() > 3">check</span>
            </div>
            <span class="step-label">Tracking & Goal</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 3"></div>
          
          <div class="step" [class.active]="currentStep() === 4" [class.completed]="currentStep() > 4" (click)="goToStep(4)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 4">4</span>
              <span class="material-icons" *ngIf="currentStep() > 4">check</span>
            </div>
            <span class="step-label">Rewards</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 4"></div>
          
          <div class="step" [class.active]="currentStep() === 5" [class.completed]="currentStep() > 5" (click)="goToStep(5)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 5">5</span>
              <span class="material-icons" *ngIf="currentStep() > 5">check</span>
            </div>
            <span class="step-label">Review</span>
          </div>
        </div>

        <form [formGroup]="wizardForm">
          
          <!-- STEP 1: TEMPLATE SELECTION -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 1">
            <h2 class="step-title">Choose a Template</h2>
            <p class="step-subtitle">Select a template to kickstart your challenge. You can customize it in the next steps.</p>
            
            <div class="filter-pills">
              <button class="pill" [class.active]="filterCategory() === 'All'" (click)="filterCategory.set('All')">All Templates</button>
              <button class="pill" [class.active]="filterCategory() === 'Transport'" (click)="filterCategory.set('Transport')">Transport</button>
              <button class="pill" [class.active]="filterCategory() === 'Energy'" (click)="filterCategory.set('Energy')">Energy</button>
              <button class="pill" [class.active]="filterCategory() === 'Water'" (click)="filterCategory.set('Water')">Water</button>
              <button class="pill" [class.active]="filterCategory() === 'Community'" (click)="filterCategory.set('Community')">Community</button>
            </div>

            <div class="template-grid">
              <div class="template-card" *ngFor="let t of filteredTemplates()" [class.selected]="selectedTemplate()?.id === t.id" (click)="selectTemplate(t)">
                <div class="t-image" [style.background]="t.color">
                  <span class="material-icons hero-icon">{{ t.icon }}</span>
                </div>
                <div class="t-content">
                  <h4>{{ t.title }}</h4>
                  <p>{{ t.desc }}</p>
                  <div class="t-badges">
                    <span class="badge badge-category">{{ t.category }}</span>
                    <span class="badge badge-popular" *ngIf="t.isPopular">Popular</span>
                    <span class="badge badge-new" *ngIf="t.isNew">New</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: BASIC INFORMATION -->
          <div class="step-content split-layout animate-fade-in" *ngIf="currentStep() === 2">
            <div class="form-section">
              <h2 class="step-title">Basic Information</h2>
              <p class="step-subtitle">Provide the basic details for your challenge.</p>
              
              <div class="form-group">
                <label for="title">Challenge Name <span class="required">*</span></label>
                <input id="title" type="text" class="premium-input" formControlName="title" [attr.aria-invalid]="isInvalid('title')" />
              </div>

              <div class="form-group">
                <label for="typeCode">Challenge Type <span class="required">*</span></label>
                <select id="typeCode" class="premium-input" formControlName="typeCode" [attr.aria-invalid]="isInvalid('typeCode')">
                  <option *ngFor="let type of challengeTypes" [value]="type.id">{{ type.label }}</option>
                </select>
              </div>

              <div class="form-group" *ngIf="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'">
                <label for="linkedCategoryId">Carbon Category <span class="required">*</span></label>
                <select id="linkedCategoryId" class="premium-input" formControlName="linkedCategoryId" [attr.aria-invalid]="isInvalid('linkedCategoryId')">
                  <option *ngFor="let cat of automaticCategories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="description">Short Description <span class="required">*</span></label>
                <textarea id="description" class="premium-input" formControlName="description" rows="3" [attr.aria-invalid]="isInvalid('description')"></textarea>
                <div class="char-count">{{ wizardForm.get('description')?.value?.length || 0 }} / 2000</div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label for="startDate">Start Date <span class="required">*</span></label>
                  <input id="startDate" type="date" class="premium-input icon-right" formControlName="startDate" [attr.aria-invalid]="isInvalid('startDate')" />
                </div>
                <div class="form-group">
                  <label for="endDate">End Date <span class="required">*</span></label>
                  <input id="endDate" type="date" class="premium-input icon-right" formControlName="endDate" [attr.aria-invalid]="isInvalid('endDate')" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Cover Image <span class="required">*</span></label>
                <div class="cover-upload-area">
                  <div class="cover-preview" [style.background]="selectedTemplate()?.color || '#e2e8f0'">
                     <span class="material-icons" style="font-size: 3rem; color: white;">{{ selectedTemplate()?.icon || 'image' }}</span>
                  </div>
                  <div class="cover-actions">
                    <button type="button" class="btn-outline-green"><span class="material-icons">image</span> Change Image</button>
                    <span class="help-text">Recommended: 1200 x 600px</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="maxParticipants">Max Participants</label>
                <input id="maxParticipants" type="number" class="premium-input" formControlName="maxParticipants" />
                <span class="help-text">Leave empty for unlimited</span>
              </div>
            </div>

            <div class="preview-section">
              <div class="preview-card">
                <h4>Template Preview</h4>
                <div class="p-image" [style.background]="selectedTemplate()?.color || '#e2e8f0'">
                  <span class="material-icons">{{ selectedTemplate()?.icon || 'image' }}</span>
                </div>
                <h3 class="p-title">{{ selectedTemplate()?.title || 'Custom Challenge' }}</h3>
                
                <div class="p-list">
                  <div class="p-item">
                    <span class="material-icons">track_changes</span>
                    <div class="p-text">
                      <small>Tracking Method</small>
                      <strong>Automatic</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">category</span>
                    <div class="p-text">
                      <small>Category</small>
                      <strong>{{ selectedTemplate()?.category || 'General' }}</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">timer</span>
                    <div class="p-text">
                      <small>Duration</small>
                      <strong>7 Days</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">emoji_events</span>
                    <div class="p-text">
                      <small>Default XP Reward</small>
                      <strong>250 XP</strong>
                    </div>
                  </div>
                </div>
                
                <div class="p-desc-section">
                  <small>Description</small>
                  <p>{{ selectedTemplate()?.desc || 'Create a custom challenge from scratch.' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- STUBS FOR STEPS 3, 4, 5 (Using the original component's fields) -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 3">
            <h2 class="step-title">Tracking & Goal</h2>
            <p class="step-subtitle">Set the progress metrics and target goals.</p>
            <div class="form-group">
              <label for="progressType">Progress Type <span class="required">*</span></label>
              <select id="progressType" class="premium-input" formControlName="progressType">
                <option value="COUNT">Count (e.g. 10 actions)</option>
                <option value="AMOUNT">Amount (e.g. 50 kg CO2)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="trackingMethod">Tracking Method <span class="required">*</span></label>
              <select id="trackingMethod" class="premium-input" formControlName="trackingMethod">
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div class="form-group">
              <label for="targetValue">Target Value <span class="required">*</span></label>
              <input id="targetValue" type="number" class="premium-input" formControlName="targetValue" />
            </div>
          </div>
          
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 4">
            <h2 class="step-title">Rewards</h2>
            <p class="step-subtitle">Configure XP and rewards for successful completion.</p>
            <div class="form-group">
              <label for="rewardXp">Reward XP <span class="required">*</span></label>
              <input id="rewardXp" type="number" class="premium-input" formControlName="rewardXp" />
            </div>
          </div>
          
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 5">
            <h2 class="step-title">Review</h2>
            <p class="step-subtitle">Review your challenge details before publishing.</p>
            <div class="summary-box">
              <h3>Challenge Summary</h3>
              <p><strong>Title:</strong> {{ wizardForm.value.title || 'Not set' }}</p>
              <p><strong>Type:</strong> {{ wizardForm.value.typeCode || 'Not set' }}</p>
              <p><strong>Goal:</strong> {{ wizardForm.value.targetValue || 0 }} ({{ wizardForm.value.progressType }})</p>
              <p><strong>Reward:</strong> {{ wizardForm.value.rewardXp || 0 }} XP</p>
            </div>
          </div>
          
        </form>

        <!-- WIZARD FOOTER -->
        <div class="wizard-footer">
          <button class="btn-cancel" *ngIf="currentStep() === 1" (click)="cancel()">Cancel</button>
          <button class="btn-cancel" *ngIf="currentStep() > 1" (click)="prevStep()">
            <span class="material-icons" style="font-size: 18px; margin-right: 4px;">arrow_back</span> Back
          </button>
          
          <div class="spacer"></div>
          
          <button class="btn-next" *ngIf="currentStep() < 5" (click)="nextStep()">
            Next <span class="material-icons" style="font-size: 18px; margin-left: 4px;">arrow_forward</span>
          </button>
          
          <button class="btn-next" *ngIf="currentStep() === 5" [disabled]="submitting()" (click)="submit()">
            {{ submitting() ? 'Publishing...' : 'Publish Challenge' }}
            <span class="material-icons" style="font-size: 18px; margin-left: 4px;" *ngIf="!submitting()">rocket_launch</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      background: #f4f7fa; min-height: 100vh; padding: 2rem; font-family: 'Inter', sans-serif;
    }
    .wizard-header-top {
      margin-bottom: 1.5rem; max-width: 1200px; margin-left: auto; margin-right: auto;
    }
    .back-link {
      background: none; border: none; font-size: 1rem; font-weight: 600; color: #0f172a; 
      display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0;
    }
    .back-link .material-icons { color: #10b981; font-size: 1.25rem; }
    
    .wizard-main-container {
      background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
      max-width: 1200px; margin: 0 auto; overflow: hidden; display: flex; flex-direction: column;
    }
    
    /* STEPPER */
    .stepper-nav {
      display: flex; align-items: center; justify-content: space-between; padding: 2rem 4rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .step {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer;
    }
    .step-circle {
      width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd5e1;
      display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: #64748b; font-weight: 500;
      background: white; transition: all 0.2s;
    }
    .step.active .step-circle { background: #10b981; color: white; border-color: #10b981; }
    .step.completed .step-circle { border-color: #10b981; color: #10b981; }
    .step.completed .step-circle .material-icons { font-size: 1.125rem; }
    .step-label { font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
    .step:not(.active):not(.completed) .step-label { color: #64748b; font-weight: 500; }
    
    .step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 1rem; position: relative; top: -12px; }
    .step-line.completed { background: #10b981; }

    /* CONTENT AREAS */
    .step-content { padding: 2.5rem 4rem; flex: 1; }
    .step-title { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: #0f172a; font-weight: 700; }
    .step-subtitle { color: #64748b; font-size: 0.9375rem; margin-bottom: 2rem; }
    
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* STEP 1 FILTERS & GRID */
    .filter-pills { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .pill { 
      padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; 
      color: #475569; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: 0.2s;
    }
    .pill:hover { background: #f8fafc; }
    .pill.active { border-color: #10b981; color: #10b981; background: #ecfdf5; font-weight: 600; }
    
    .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .template-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .template-grid { grid-template-columns: 1fr; } }
    
    .template-card { 
      border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; cursor: pointer; transition: 0.2s;
      display: flex; flex-direction: column; background: white;
    }
    .template-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .template-card.selected { border-color: #10b981; box-shadow: 0 0 0 1px #10b981; }
    
    .t-image { height: 160px; display: flex; align-items: center; justify-content: center; }
    .hero-icon { font-size: 4rem; color: white; opacity: 0.9; }
    .t-content { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
    .t-content h4 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #0f172a; font-weight: 700; }
    .t-content p { margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b; line-height: 1.5; flex: 1; }
    
    .t-badges { display: flex; gap: 0.5rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-category { background: #ecfdf5; color: #10b981; }
    .badge-popular { background: #eff6ff; color: #3b82f6; }
    .badge-new { background: #eff6ff; color: #3b82f6; }

    /* STEP 2 SPLIT LAYOUT */
    .split-layout { display: grid; grid-template-columns: 1fr 340px; gap: 3rem; }
    @media (max-width: 900px) { .split-layout { grid-template-columns: 1fr; } }
    
    .form-group { margin-bottom: 1.5rem; position: relative; }
    .form-group label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem; color: #334155; }
    .required { color: #ef4444; }
    
    .premium-input {
      width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.75rem 1rem; 
      font-size: 0.9375rem; color: #0f172a; transition: 0.2s; font-family: inherit;
    }
    .premium-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px #ecfdf5; }
    .premium-input::placeholder { color: #94a3b8; }
    textarea.premium-input { resize: vertical; }
    .char-count { text-align: right; font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    
    .cover-upload-area { display: flex; gap: 1.5rem; align-items: center; }
    .cover-preview { width: 140px; height: 80px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .cover-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    .btn-outline-green { 
      background: white; border: 1px solid #cbd5e1; color: #10b981; font-weight: 600; font-size: 0.875rem;
      padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-outline-green:hover { background: #f8fafc; border-color: #10b981; }
    .help-text { font-size: 0.75rem; color: #64748b; }

    /* PREVIEW CARD */
    .preview-card {
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; background: #fff;
    }
    .preview-card h4 { margin: 0 0 1rem 0; font-size: 0.875rem; color: #0f172a; font-weight: 700; }
    .p-image { height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
    .p-image .material-icons { font-size: 3rem; color: white; }
    .p-title { margin: 0 0 1.5rem 0; font-size: 1.125rem; font-weight: 700; color: #0f172a; }
    
    .p-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
    .p-item { display: flex; align-items: center; gap: 1rem; }
    .p-item .material-icons { color: #10b981; font-size: 1.25rem; }
    .p-text { display: flex; flex-direction: column; }
    .p-text small { font-size: 0.75rem; color: #64748b; }
    .p-text strong { font-size: 0.875rem; color: #0f172a; font-weight: 600; }
    
    .p-desc-section small { font-size: 0.75rem; color: #64748b; }
    .p-desc-section p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #0f172a; line-height: 1.5; }

    /* FOOTER */
    .wizard-footer {
      display: flex; padding: 1.5rem 4rem; border-top: 1px solid #f1f5f9; background: white; align-items: center;
    }
    .spacer { flex: 1; }
    .btn-cancel {
      background: white; border: 1px solid #e2e8f0; color: #0f172a; padding: 0.75rem 1.5rem;
      border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center;
    }
    .btn-cancel:hover { background: #f8fafc; }
    
    .btn-next {
      background: #059669; color: white; border: none; padding: 0.75rem 1.5rem;
      border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; transition: 0.2s;
    }
    .btn-next:hover { background: #047857; }
    .btn-next:disabled { opacity: 0.7; cursor: not-allowed; }
    
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-top: 2rem; }
    .summary-box h3 { margin: 0 0 1rem 0; font-size: 1.125rem; }
    .summary-box p { margin: 0 0 0.5rem 0; color: #334155; }
  `]
})
export class WizardComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  currentStep = signal<number>(1);
  submitting = signal<boolean>(false);
  isSaved = false;
  
  filterCategory = signal<string>('All');
  selectedTemplate = signal<Template | null>(null);

  challengeTypes = Object.values(CHALLENGE_TYPES);
  automaticCategories = signal<CarbonCategory[]>([]);

  templates: Template[] = [
    { id: 't1', title: 'Green Commute Week', desc: 'Encourage eco-friendly travel by using cycles, public transport or carpool.', category: 'Transport', isPopular: true, color: '#a7f3d0', icon: 'directions_bike' },
    { id: 't3', title: 'Water Conservation Month', desc: 'Save water and create a sustainable future.', category: 'Water', isPopular: true, color: '#bae6fd', icon: 'water_drop' },
    { id: 't4', title: 'Energy Saver Sprint', desc: 'Save energy at home and workplace.', category: 'Energy', isNew: true, color: '#fef08a', icon: 'bolt' }
  ];

  wizardForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    typeCode: ['COMMUNITY', [Validators.required]],
    linkedCategoryId: [null],
    progressType: ['COUNT', [Validators.required]],
    trackingMethod: ['AUTOMATIC', [Validators.required]],
    targetValue: [100, [Validators.required, Validators.min(1)]],
    rewardXp: [250, [Validators.required, Validators.min(0)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    maxParticipants: ['']
  });

  ngOnInit() {
    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.automaticCategories.set(cats);
    });
    this.onTrackingMethodChange();
  }

  onTrackingMethodChange() {
    const trackingMethod = this.wizardForm.get('trackingMethod')?.value;
    if (trackingMethod === 'MANUAL') {
      this.wizardForm.get('linkedCategoryId')?.clearValidators();
      this.wizardForm.get('linkedCategoryId')?.setValue(null);
    } else {
      this.wizardForm.get('linkedCategoryId')?.setValidators([Validators.required]);
    }
    this.wizardForm.get('linkedCategoryId')?.updateValueAndValidity();
  }

  filteredTemplates(): Template[] {
    if (this.filterCategory() === 'All') return this.templates;
    return this.templates.filter(t => t.category === this.filterCategory());
  }

  selectTemplate(t: Template) {
    this.selectedTemplate.set(t);
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (this.isSaved || (!this.wizardForm.dirty && !this.selectedTemplate())) {
      return true;
    }
    return window.confirm('Discard draft and go back?');
  }

  isInvalid(field: string): boolean {
    const control = this.wizardForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  nextStep() {
    if (this.currentStep() === 1) {
      if (!this.selectedTemplate()) {
        this.toast.error('Please select a template to continue.');
        return;
      }
      // Populate defaults based on template
      if (!this.wizardForm.get('title')?.value) {
        this.wizardForm.patchValue({
          title: this.selectedTemplate()?.title,
          description: this.selectedTemplate()?.desc,
          typeCode: this.selectedTemplate()?.category.toUpperCase()
        });
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (this.wizardForm.get('title')?.valid && this.wizardForm.get('description')?.valid && this.wizardForm.get('startDate')?.valid && this.wizardForm.get('endDate')?.valid) {
        this.currentStep.set(3);
      } else {
        ['title', 'description', 'startDate', 'endDate'].forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please fill required fields.');
      }
    } else if (this.currentStep() === 3) {
      this.currentStep.set(4);
    } else if (this.currentStep() === 4) {
      this.currentStep.set(5);
    }
  }

  prevStep() {
    this.currentStep.set(this.currentStep() - 1);
  }

  cancel() {
    this.isSaved = true;
    this.router.navigate(['/admin/challenges']);
  }

  submit() {
    if (this.wizardForm.invalid) {
      this.toast.error('Please correct the errors in the form.');
      return;
    }
    this.submitting.set(true);
    const formValue = this.wizardForm.value;
    const request: ChallengeRequest = {
      title: formValue.title,
      description: formValue.description,
      typeCode: formValue.typeCode,
      linkedCategoryId: formValue.trackingMethod === 'AUTOMATIC' ? Number(formValue.linkedCategoryId) : undefined,
      progressType: formValue.progressType,
      trackingMethod: formValue.trackingMethod,
      targetValue: Number(formValue.targetValue),
      rewardXp: Number(formValue.rewardXp),
      startDate: formValue.startDate.includes('T') ? formValue.startDate : formValue.startDate + 'T00:00:00',
      endDate: formValue.endDate.includes('T') ? formValue.endDate : formValue.endDate + 'T23:59:59'
    };

    this.challengeService.createChallenge(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isSaved = true;
        this.toast.success('Challenge launched successfully!');
        this.router.navigate(['/admin/challenges/library']);
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Failed to create Challenge.');
      }
    });
  }
}
