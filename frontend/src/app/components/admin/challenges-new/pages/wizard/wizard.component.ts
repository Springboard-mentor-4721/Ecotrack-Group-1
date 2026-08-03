import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ChallengeRequest } from '../../../../../models/challenge.models';
import { CanComponentDeactivate } from '../../guards/unsaved-changes.guard';
import { CHALLENGE_TYPES } from '../../shared/challenge-types.config';
import { CarbonCategory } from '../../../../../models/carbon-category.models';


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
      
      <div *ngIf="isDuplicating" class="duplicate-banner animate-fade-in" style="background: #e0e7ff; color: #3730a3; padding: 1rem 1.5rem; margin: 0 2rem 1rem 2rem; border-radius: 8px; border-left: 4px solid #6366f1; display: flex; align-items: center; gap: 1rem;">
        <span class="material-icons" style="font-size: 1.5rem;">content_copy</span>
        <div>
          <h4 style="margin: 0; font-size: 1rem;">Duplicating Challenge</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">This form has been pre-filled from <strong>{{ originalName }}</strong>. Review the details, set new dates, and create a new challenge.</p>
        </div>
      </div>

      <div class="wizard-main-container">
        
        <!-- STEPPER NAV -->
        <div class="stepper-nav">
          <div class="step" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1" (click)="goToStep(1)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 1">1</span>
              <span class="material-icons" *ngIf="currentStep() > 1">check</span>
            </div>
            <span class="step-label">Basic Info</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 1"></div>
          
          <div class="step" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2" (click)="goToStep(2)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 2">2</span>
              <span class="material-icons" *ngIf="currentStep() > 2">check</span>
            </div>
            <span class="step-label">Tracking & Goal</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 2"></div>
          
          <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3" (click)="goToStep(3)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 3">3</span>
              <span class="material-icons" *ngIf="currentStep() > 3">check</span>
            </div>
            <span class="step-label">Review</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 3"></div>
          
          <div class="step" [class.active]="currentStep() === 4" [class.completed]="currentStep() > 4" (click)="goToStep(4)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 4">4</span>
              <span class="material-icons" *ngIf="currentStep() > 4">check</span>
            </div>
            <span class="step-label">Publish</span>
          </div>
        </div>

        <form [formGroup]="wizardForm">
          
          <!-- STEP 1: BASIC INFORMATION -->
          <div class="step-content split-layout animate-fade-in" *ngIf="currentStep() === 1">
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
                  <div class="cover-preview" [style.background]="'#10b981'">
                     <span class="material-icons" style="font-size: 3rem; color: white;">eco</span>
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
                <h4>Challenge Preview</h4>
                <div class="p-image" [style.background]="'#10b981'">
                  <span class="material-icons">eco</span>
                </div>
                <h3 class="p-title">{{ wizardForm.value.title || 'Custom Challenge' }}</h3>
                
                <div class="p-list">
                  <div class="p-item">
                    <span class="material-icons">track_changes</span>
                    <div class="p-text">
                      <small>Tracking Method</small>
                      <strong>{{ wizardForm.value.trackingMethod === 'AUTOMATIC' ? 'Automatic' : 'Manual' }}</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">category</span>
                    <div class="p-text">
                      <small>Category</small>
                      <strong>{{ wizardForm.value.typeCode || 'General' }}</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">emoji_events</span>
                    <div class="p-text">
                      <small>Default XP Reward</small>
                      <strong>{{ wizardForm.value.rewardXp || 0 }} XP</strong>
                    </div>
                  </div>
                </div>
                
                <div class="p-desc-section">
                  <small>Description</small>
                  <p>{{ wizardForm.value.description || 'Challenge description will appear here.' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- STEP 2: TRACKING & GOAL -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 2">
            <h2 class="step-title">Tracking & Goal Configuration</h2>
            <p class="step-subtitle">Define how progress will be tracked and set the goal.</p>
            
            <div class="form-section">
              <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Tracking Method</h4>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <p style="font-size: 0.8125rem; color: #64748b; margin: 0;">Choose how participants can earn progress in this challenge.</p>
                <button *ngIf="isTemplate" class="btn btn-sm btn-outline-warning rounded-pill" (click)="isTemplate = false">
                  <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">lock_open</span> Unlock Template
                </button>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <div class="tracking-card" [class.active]="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'" (click)="wizardForm.patchValue({trackingMethod: 'AUTOMATIC'}); onTrackingMethodChange()">
                  <div class="tc-icon-wrapper"><span class="material-icons tc-icon">eco</span></div>
                  <div class="tc-content">
                    <h5>Automatic Tracking</h5>
                    <p>Track based on eco-friendly actions. Progress is calculated automatically based on participants' activities.</p>
                  </div>
                  <div class="tc-radio"><span class="material-icons" *ngIf="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'">check_circle</span></div>
                </div>
                
                <div class="tracking-card" [class.active]="wizardForm.get('trackingMethod')?.value === 'MANUAL'" (click)="wizardForm.patchValue({trackingMethod: 'MANUAL'}); onTrackingMethodChange()">
                  <div class="tc-icon-wrapper manual"><span class="material-icons tc-icon">description</span></div>
                  <div class="tc-content">
                    <h5>Manual Tracking</h5>
                    <p>Log progress manually. Participants will log their progress manually.</p>
                  </div>
                  <div class="tc-radio"><span class="material-icons" *ngIf="wizardForm.get('trackingMethod')?.value === 'MANUAL'">check_circle</span></div>
                </div>
              </div>

              <div *ngIf="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'" style="margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Select Tracking Rules</h4>
                <p style="font-size: 0.8125rem; color: #64748b; margin-bottom: 1rem;">Choose the rule category that will contribute to this challenge's progress.</p>
                <select class="premium-input" formControlName="linkedCategoryId" style="max-width: 400px;">
                  <option *ngFor="let cat of automaticCategories()" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div *ngIf="wizardForm.get('trackingMethod')?.value === 'MANUAL'" style="margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Manual Tracking Rules</h4>
                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                  <div class="form-check" style="display: flex; align-items: center; gap: 0.5rem;">
                    <input class="form-check-input mt-0" type="checkbox" id="approvalReq" formControlName="approvalRequired">
                    <label class="form-check-label m-0" for="approvalReq">Admin Approval Required</label>
                  </div>
                  <div class="form-check" style="display: flex; align-items: center; gap: 0.5rem;">
                    <input class="form-check-input mt-0" type="checkbox" id="evidenceReq" formControlName="evidenceRequired">
                    <label class="form-check-label m-0" for="evidenceReq">Evidence Required</label>
                  </div>
                  <div style="flex-basis: 100%;">
                    <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Submission Type</label>
                    <select class="premium-input" formControlName="submissionType" style="max-width: 250px;">
                      <option value="TEXT">Text Only</option>
                      <option value="PHOTO">Photo Only</option>
                      <option value="PHOTO/TEXT">Photo & Text</option>
                    </select>
                  </div>
                </div>
              </div>

              <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Goal Configuration</h4>
              <div style="display: flex; gap: 1rem; align-items: flex-end;">
                <div style="flex: 2;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Goal Type</label>
                  <select class="premium-input" formControlName="progressType">
                    <option value="COUNT">Count (e.g. 10 actions)</option>
                    <option value="AMOUNT">Amount (e.g. 50 kg CO2)</option>
                  </select>
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Target</label>
                  <input type="number" class="premium-input" formControlName="targetValue" />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">XP Reward</label>
                  <input type="number" class="premium-input" formControlName="rewardXp" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- STEP 3: REVIEW -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 3">
            <h2 class="step-title">Review Challenge Details</h2>
            <p class="step-subtitle">Please review all the information before publishing.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 400px; gap: 2rem;">
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; background: #fff;">
                <div class="review-row">
                  <span class="material-icons review-icon">badge</span>
                  <div>
                    <small>Challenge Name</small>
                    <strong>{{ wizardForm.value.title || 'Not set' }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">category</span>
                  <div>
                    <small>Category</small>
                    <strong>{{ wizardForm.value.typeCode || 'Not set' }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">calendar_today</span>
                  <div>
                    <small>Duration</small>
                    <strong>{{ wizardForm.value.startDate | date }} - {{ wizardForm.value.endDate | date }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">insights</span>
                  <div>
                    <small>Tracking Method</small>
                    <strong>{{ wizardForm.value.trackingMethod === 'AUTOMATIC' ? 'Automatic Tracking' : 'Manual Tracking' }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">track_changes</span>
                  <div>
                    <small>Goal</small>
                    <strong>{{ wizardForm.value.targetValue || 0 }} ({{ wizardForm.value.progressType }})</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">redeem</span>
                  <div>
                    <small>XP Reward</small>
                    <strong>{{ wizardForm.value.rewardXp || 0 }} XP</strong>
                  </div>
                </div>
              </div>
              
              <div class="preview-card" style="margin: 0; align-self: start;">
                <h4 style="margin-bottom: 1rem; color: #0f172a; font-weight: 700;">Challenge Preview</h4>
                <div class="p-image" [style.background]="'#10b981'">
                  <span class="material-icons" style="font-size: 4rem; color: white;">eco</span>
                </div>
                <h3 class="p-title" style="margin-bottom: 0.5rem;">{{ wizardForm.value.title || 'Challenge Title' }}</h3>
                <p style="font-size: 0.875rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem;">{{ wizardForm.value.description || 'Challenge description will appear here.' }}</p>
                
                <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-bottom: 0.75rem;">
                  <span style="color: #64748b;">Max Participants</span>
                  <strong style="color: #0f172a;">{{ wizardForm.value.maxParticipants || 'Unlimited' }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
                  <span style="color: #64748b;">XP Reward</span>
                  <strong style="color: #0f172a;">{{ wizardForm.value.rewardXp || 0 }} XP</strong>
                </div>
              </div>
            </div>
          </div>
          
          <!-- STEP 4: PUBLISHING -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 4">
            <div style="text-align: center; padding: 4rem 2rem;">
              <span class="material-icons" style="font-size: 6rem; color: #10b981; margin-bottom: 1.5rem;">rocket_launch</span>
              <h2 style="font-size: 2rem; color: #0f172a; margin-bottom: 1rem;">Publishing Challenge...</h2>
              <p style="color: #64748b;">Please wait while we set up your new challenge.</p>
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
          
          <button class="btn-next" *ngIf="currentStep() < 3" (click)="nextStep()">
            Next <span class="material-icons" style="font-size: 18px; margin-left: 4px;">arrow_forward</span>
          </button>
          
          <button class="btn-next" *ngIf="currentStep() === 3" [disabled]="submitting()" (click)="submit()">
            {{ submitting() ? 'Publishing...' : 'Publish Challenge' }}
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
    
    .tracking-card {
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; gap: 1rem; cursor: pointer; transition: 0.2s;
    }
    .tracking-card.active { border-color: #10b981; background: #f0fdf4; box-shadow: 0 0 0 1px #10b981; }
    .tc-icon-wrapper { width: 48px; height: 48px; border-radius: 8px; background: #d1fae5; display: flex; align-items: center; justify-content: center; }
    .tc-icon-wrapper.manual { background: #f1f5f9; }
    .tc-icon { color: #10b981; font-size: 1.5rem; }
    .tc-icon-wrapper.manual .tc-icon { color: #64748b; }
    .tc-content { flex: 1; }
    .tc-content h5 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #0f172a; }
    .tc-content p { margin: 0; font-size: 0.8125rem; color: #64748b; line-height: 1.4; }
    .tc-radio { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; border: 1px solid #cbd5e1; }
    .tracking-card.active .tc-radio { border: none; }
    .tc-radio .material-icons { color: #10b981; font-size: 24px; }
    
    .review-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .review-icon { color: #64748b; font-size: 1.5rem; }
    .review-row small { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
    .review-row strong { display: block; font-size: 0.875rem; color: #0f172a; }
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
  isDuplicating = false;
  isEditMode = false;
  isTemplate = false;
  editChallengeId: number | null = null;
  originalName = '';

  challengeTypes = Object.values(CHALLENGE_TYPES);
  automaticCategories = signal<CarbonCategory[]>([]);

  wizardForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    typeCode: ['COMMUNITY', [Validators.required]],
    linkedCategoryId: [null],
    carbonCategoryCode: [null],
    progressType: ['COUNT', [Validators.required]],
    trackingMethod: ['AUTOMATIC', [Validators.required]],
    approvalRequired: [false],
    submissionType: ['PHOTO/TEXT'],
    evidenceRequired: [false],
    targetValue: [100, [Validators.required, Validators.min(1)]],
    rewardXp: [250, [Validators.required, Validators.min(0)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    maxParticipants: ['']
  });

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state;
    if (state && state['duplicateData']) {
      this.isDuplicating = true;
      this.originalName = state['originalName'];
      
      setTimeout(() => {
        this.wizardForm.patchValue(state['duplicateData']);
        this.wizardForm.markAllAsTouched(); // Trigger validation UI
      });
    } else if (state && state['templateData']) {
      this.isTemplate = true;
      // Prefill with template data
      setTimeout(() => {
        this.wizardForm.patchValue(state['templateData']);
        if (state['templateData']?.rulesConfig) {
           this.wizardForm.patchValue(state['templateData'].rulesConfig);
        }
        this.wizardForm.markAllAsTouched();
      });
    }
  }

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.automaticCategories.set(cats);
    });
    this.onTrackingMethodChange();

    // Check for edit mode
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const idParam = params.get('id');
      const url = this.router.url;
      
      if (idParam && url.endsWith('/edit')) {
        const numericId = Number(idParam);
        if (!isNaN(numericId)) {
          this.isEditMode = true;
          this.editChallengeId = numericId;
          this.loadChallengeForEdit(numericId);
        } else {
          this.toast.error('Invalid challenge ID');
          this.router.navigate(['/admin/challenges']);
        }
      }
    });
  }

  loadChallengeForEdit(id: number) {
    this.challengeService.getChallengeDetail(id).subscribe({
      next: (challenge) => {
        // Build payload for form
        const rules = challenge.rulesConfig || {};
        const formData = {
          title: challenge.title,
          description: challenge.description,
          typeCode: challenge.typeCode,
          linkedCategoryId: challenge.linkedCategoryId,
          carbonCategoryCode: challenge.carbonCategoryCode,
          rewardXp: challenge.rewardXp,
          progressType: challenge.progressType,
          trackingMethod: challenge.trackingMethod,
          approvalRequired: rules.approvalRequired || false,
          submissionType: rules.submissionType || 'PHOTO/TEXT',
          evidenceRequired: rules.evidenceRequired || false,
          targetValue: challenge.targetValue,
          startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().split('T')[0] : '',
          endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().split('T')[0] : '',
          maxParticipants: challenge.participantCount || ''
        };
        this.wizardForm.patchValue(formData);
        this.wizardForm.markAllAsTouched();
      },
      error: () => {
        this.toast.error('Failed to load challenge for editing.');
        this.router.navigate(['/admin/challenges']);
      }
    });
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

  canDeactivate(): boolean | Promise<boolean> {
    if (this.isSaved || !this.wizardForm.dirty) {
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
      if (this.wizardForm.get('title')?.valid && this.wizardForm.get('description')?.valid && this.wizardForm.get('startDate')?.valid && this.wizardForm.get('endDate')?.valid) {
        this.currentStep.set(2);
      } else {
        ['title', 'description', 'startDate', 'endDate'].forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please fill required fields.');
      }
    } else if (this.currentStep() === 2) {
      if (this.wizardForm.get('progressType')?.valid && this.wizardForm.get('trackingMethod')?.valid && this.wizardForm.get('targetValue')?.valid && this.wizardForm.get('rewardXp')?.valid) {
        this.currentStep.set(3);
      } else {
        this.toast.error('Please complete goal configuration.');
      }
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

    if (this.isEditMode && this.editChallengeId) {
      this.challengeService.updateChallenge(this.editChallengeId, request).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.isSaved = true;
          this.toast.success('Challenge updated successfully!');
          this.router.navigate(['/admin/challenges', this.editChallengeId]);
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Failed to update Challenge.');
        }
      });
    } else {
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
}
