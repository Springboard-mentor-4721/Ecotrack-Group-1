import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { AdminService } from '../../../../../services/admin.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ChallengeRequest } from '../../../../../models/challenge.models';
import { AdminBadge } from '../../../../../models/gamification.models';
import { CanComponentDeactivate } from '../../guards/unsaved-changes.guard';

import { CarbonCategory, CarbonSubcategory } from '../../../../../models/carbon-category.models';
import { environment } from '../../../../../../environments/environment';
import { TemplateTrackingMapperService } from '../../services/template-tracking-mapper.service';
import { TrackingSourceCode } from '../../../../../models/challenge-template.model';

@Component({
  selector: 'app-admin-challenges-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="wizard-page">
      <div class="wizard-header-top">
        <button class="back-link" (click)="cancel()">
          <span class="material-icons">arrow_back</span> Back to Templates
        </button>
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #0f172a; position: absolute; left: 50%; transform: translateX(-50%); pointer-events: none;">Create Challenge</h2>
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
            <span class="step-label">Tracking Behavior</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 2"></div>
          
          <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3" (click)="goToStep(3)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 3">3</span>
              <span class="material-icons" *ngIf="currentStep() > 3">check</span>
            </div>
            <span class="step-label">Evaluation & Target</span>
          </div>
          <div class="step-line" [class.completed]="currentStep() > 3"></div>
          
          <div class="step" [class.active]="currentStep() === 4" [class.completed]="currentStep() > 4" (click)="goToStep(4)">
            <div class="step-circle">
              <span *ngIf="currentStep() <= 4">4</span>
              <span class="material-icons" *ngIf="currentStep() > 4">check</span>
            </div>
            <span class="step-label">Review</span>
          </div>
        </div>

        <form [formGroup]="wizardForm">
          
          <!-- STEPS 1-3 WITH SPLIT LAYOUT -->
          <div class="split-layout" *ngIf="currentStep() < 4">
            <div class="form-section-wrapper" style="min-width: 0;">
              
              <!-- STEP 1: BASIC INFORMATION -->
              <div class="step-content animate-fade-in" *ngIf="currentStep() === 1">
            <div class="form-section">
              <h2 class="step-title">Basic Information</h2>
              <p class="step-subtitle">Provide the basic details for your challenge.</p>
              
              <div class="form-group">
                <label for="title">Challenge Name <span class="required">*</span></label>
                <input id="title" type="text" class="premium-input" formControlName="title" [attr.aria-invalid]="isInvalid('title')" aria-describedby="title-error" />
                <div id="title-error" class="validation-error" *ngIf="isInvalid('title')">Challenge name is required and must be at least 5 characters.</div>
              </div>

              <div class="form-group">
                <label for="description">Short Description <span class="required">*</span></label>
                <textarea id="description" class="premium-input" formControlName="description" rows="3" [attr.aria-invalid]="isInvalid('description')" aria-describedby="desc-error"></textarea>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div id="desc-error" class="validation-error" *ngIf="isInvalid('description')">Description is required.</div>
                  <div class="char-count" style="margin-left: auto;">{{ wizardForm.get('description')?.value?.length || 0 }} / 2000</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                <div class="form-group">
                  <label for="startDate">Start Date <span class="required">*</span></label>
                  <input id="startDate" type="datetime-local" class="premium-input icon-right" formControlName="startDate" [attr.aria-invalid]="isInvalid('startDate')" aria-describedby="start-error" [min]="minDate" />
                  <div id="start-error" class="validation-error" *ngIf="isInvalid('startDate')">Valid start date is required.</div>
                </div>
                <div class="form-group">
                  <label for="durationDays">Duration (Days)</label>
                  <input id="durationDays" type="number" class="premium-input" formControlName="durationDays" min="1" placeholder="e.g. 7" />
                </div>
                <div class="form-group">
                  <label for="endDate">End Date <span class="required">*</span></label>
                  <input id="endDate" type="datetime-local" class="premium-input icon-right" formControlName="endDate" [attr.aria-invalid]="isInvalid('endDate')" aria-describedby="end-error" [min]="wizardForm.get('startDate')?.value || minDate" />
                  <div id="end-error" class="validation-error" *ngIf="isInvalid('endDate')">Valid end date is required.</div>
                </div>
              </div>
              
              <div class="form-group">
                <label>Cover Image</label>
                <div class="cover-upload-area">
                  <div class="cover-preview" [style.backgroundColor]="'#10b981'" style="overflow: hidden;">
                     <img *ngIf="imagePreviewUrl" [src]="resolveImageUrl(imagePreviewUrl)" (error)="onImageError()" style="width:100%; height:100%; object-fit:cover;" />
                     <span class="material-icons" style="font-size: 3rem; color: white;" *ngIf="!imagePreviewUrl">eco</span>
                  </div>
                  <div class="cover-actions">
                    <input type="file" #fileInput (change)="onImageSelected($event)" accept="image/jpeg,image/png,image/webp" style="display: none;">
                    <button type="button" class="btn-outline-green" (click)="fileInput.click()"><span class="material-icons">image</span> Change Image</button>
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
          </div>
          
          <!-- STEP 2: TRACKING BEHAVIOR -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 2">
            <h2 class="step-title">Tracking Behavior</h2>
            <p class="step-subtitle">Define how progress will be tracked for this challenge.</p>
            
            <div class="form-section">
              <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Tracking Method</h4>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <p style="font-size: 0.8125rem; color: #64748b; margin: 0;">Choose how participants can earn progress in this challenge.</p>
                <button *ngIf="isTemplate" class="btn btn-sm btn-outline-warning rounded-pill" (click)="isTemplate = false">
                  <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">lock_open</span> Unlock Template
                </button>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <div class="tracking-card" [class.active]="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'" (click)="wizardForm.patchValue({trackingMethod: 'AUTOMATIC'})" role="radio" [attr.aria-checked]="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'" tabindex="0">
                  <div class="tc-icon-wrapper"><span class="material-icons tc-icon">eco</span></div>
                  <div class="tc-content">
                    <h5>Automatic Tracking</h5>
                    <p>Progress is calculated automatically from eco-friendly carbon entries.</p>
                  </div>
                  <div class="tc-radio"><span class="material-icons" *ngIf="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'">check_circle</span></div>
                </div>
                
                <div class="tracking-card" [class.active]="wizardForm.get('trackingMethod')?.value === 'MANUAL'" (click)="wizardForm.patchValue({trackingMethod: 'MANUAL'})" role="radio" [attr.aria-checked]="wizardForm.get('trackingMethod')?.value === 'MANUAL'" tabindex="0">
                  <div class="tc-icon-wrapper manual"><span class="material-icons tc-icon">description</span></div>
                  <div class="tc-content">
                    <h5>Manual Tracking</h5>
                    <p>Participants submit/log their progress manually.</p>
                  </div>
                  <div class="tc-radio"><span class="material-icons" *ngIf="wizardForm.get('trackingMethod')?.value === 'MANUAL'">check_circle</span></div>
                </div>
              </div>

              <!-- AUTOMATIC TRACKING CONFIGURATION -->
              <div *ngIf="wizardForm.get('trackingMethod')?.value === 'AUTOMATIC'" style="margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Tracking Sources</h4>
                <p style="font-size: 0.8125rem; color: #64748b; margin-bottom: 1rem;">Select specific subcategories to aggregate progress for this challenge.</p>
                  
                <div style="margin-bottom: 1rem;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Category Filter</label>
                  <select class="premium-input" style="max-width: 400px;" (change)="multiSourceFilterCategoryId = $any($event.target).value">
                    <option value="ALL" [selected]="multiSourceFilterCategoryId === 'ALL'">All Categories</option>
                    <option *ngFor="let cat of automaticCategories()" [value]="cat.id" [selected]="multiSourceFilterCategoryId == cat.id">{{ cat.name }}</option>
                  </select>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; background: white; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px;">
                  <div *ngFor="let sub of getFilteredSubcategories()" 
                       (click)="toggleSubcategoryId(sub.id)"
                       style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #0f172a; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #e2e8f0; cursor: pointer; user-select: none;"
                       [style.opacity]="resolvedSubcategoryIds.includes(sub.id) ? '1' : '0.5'"
                       [style.borderColor]="resolvedSubcategoryIds.includes(sub.id) ? '#10b981' : '#e2e8f0'">
                    <span class="material-icons" [style.color]="resolvedSubcategoryIds.includes(sub.id) ? '#10b981' : '#64748b'" style="font-size: 1.1rem;">
                      {{ resolvedSubcategoryIds.includes(sub.id) ? 'check_box' : 'check_box_outline_blank' }}
                    </span> {{ sub.name }}
                  </div>
                  <div *ngIf="getFilteredSubcategories().length === 0" style="color: #64748b; font-size: 0.875rem;">
                    No tracking sources found for this category.
                  </div>
                </div>
                <div *ngIf="resolvedSubcategoryIds.length === 0 && wizardForm.get('progressMetric')?.value !== 'CARBON_EMISSION'" style="color: #ef4444; font-size: 0.875rem; margin-top: 0.5rem;">
                  At least one tracking source must be selected for Automatic tracking (unless it's an all-carbon emissions challenge).
                </div>
                <div *ngIf="unitConflictWarning" style="color: #f59e0b; font-size: 0.875rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
                  <span class="material-icons" style="font-size: 1rem;">warning</span>
                  Warning: The selected sources have conflicting units. Please ensure they use the same physical quantity.
                </div>
              </div>



              <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Progress Measurement</h4>
              <div style="margin-bottom: 1rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Metric</label>
                <select class="premium-input" formControlName="progressMetric" style="max-width: 400px;">
                  <option value="CARBON_EMISSION">Carbon Emissions (kgCO2e)</option>
                  <option value="QUANTITY">Physical Quantity (e.g. km, litres, kg)</option>
                  <option value="ENTRY_COUNT">Number of Entries (e.g. actions, trips)</option>
                </select>
              </div>
              <div style="font-size: 0.875rem; color: #0f172a; margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; display: inline-block;">
                Derived Unit: <strong>{{ derivedUnitLabel }}</strong>
              </div>
            </div>
          </div>
          
          <!-- STEP 3: EVALUATION & TARGET -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 3">
            <h2 class="step-title">Evaluation & Target</h2>
            <p class="step-subtitle">Define the evaluation criteria and numeric goal for the challenge.</p>
            
            <div class="form-section">
              <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Evaluation Type</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                <!-- Achievement Card -->
                <div class="tracking-card" [class.active]="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'" 
                     (click)="wizardForm.patchValue({challengeEvaluationType: 'ACHIEVEMENT'})" role="radio" [attr.aria-checked]="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'" tabindex="0">
                  <div class="tc-icon-wrapper" style="background: #e0f2fe; color: #0284c7;">
                    <span class="material-icons tc-icon">emoji_events</span>
                  </div>
                  <div class="tc-content">
                    <h5>Achievement Challenge</h5>
                    <div style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                      User reaches or exceeds a target.
                    </div>
                  </div>
                  <div class="tc-radio">
                    <span class="material-icons" *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'">check_circle</span>
                  </div>
                </div>
                
                <!-- Budget Card -->
                <div class="tracking-card" [class.active]="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET'" 
                     (click)="wizardForm.patchValue({challengeEvaluationType: 'BUDGET'})" role="radio" [attr.aria-checked]="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET'" tabindex="0">
                  <div class="tc-icon-wrapper" style="background: #fef9c3; color: #ca8a04;">
                    <span class="material-icons tc-icon">account_balance_wallet</span>
                  </div>
                  <div class="tc-content">
                    <h5>Budget Challenge</h5>
                    <div style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                      User stays at or below a limit.
                    </div>
                  </div>
                  <div class="tc-radio">
                    <span class="material-icons" *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET'">check_circle</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 2rem; align-items: flex-start; margin-bottom: 2rem;">
                <div style="flex: 1; position: relative;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">{{ wizardForm.get('challengeEvaluationType')?.value === 'BUDGET' ? 'Budget Value' : 'Target Value' }} ({{ derivedUnitLabel }}) <span class="required">*</span></label>
                  <input type="number" class="premium-input" formControlName="targetValue" [attr.aria-invalid]="isInvalid('targetValue')" aria-describedby="target-error" />
                  <div id="target-error" class="validation-error" *ngIf="isInvalid('targetValue')">Valid target required ({{ wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT' ? '> 0' : '>= 0' }}).</div>
                  <div class="validation-error" *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT' && wizardForm.get('targetValue')?.value === 0">
                    An Achievement challenge must have a target greater than 0.
                  </div>
                </div>
                
                <div style="flex: 1; position: relative;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">XP Reward <span class="required">*</span></label>
                  <input type="number" class="premium-input" formControlName="rewardXp" [attr.aria-invalid]="isInvalid('rewardXp')" aria-describedby="xp-error" />
                  <div id="xp-error" class="validation-error" *ngIf="isInvalid('rewardXp')">Valid XP required.</div>
                </div>
              </div>

              <div style="margin-bottom: 2rem;">
                <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Challenge Badge (Optional)</label>
                <select class="premium-input" formControlName="badgeId">
                  <option [ngValue]="null">No Badge</option>
                  <option *ngFor="let badge of challengeBadges" [ngValue]="badge.id">
                    {{ badge.name }} ({{ badge.rarity }})
                  </option>
                </select>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                  Select a Challenge-specific badge to award upon completion. Generic milestone badges are not available here.
                </div>
              </div>

              <div style="padding: 1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; color: #0369a1; font-size: 0.875rem;">
                <span class="material-icons" style="font-size: 1rem; vertical-align: middle; margin-right: 0.25rem;">info</span>
                <span *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'">
                  Participants complete this challenge by reaching or exceeding the target of {{ wizardForm.value.targetValue !== null && wizardForm.value.targetValue !== '' ? wizardForm.value.targetValue : '[Target]' }} {{ derivedUnitLabel }}.
                </span>
                <span *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET' && wizardForm.value.targetValue > 0">
                  Participants complete this challenge by staying at or below the limit of {{ wizardForm.value.targetValue }} {{ derivedUnitLabel }}.
                </span>
                <span *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET' && wizardForm.value.targetValue === 0">
                  <strong>Zero-usage challenge:</strong> participants must keep matching activity at zero. Any matching activity will exceed the budget.
                </span>
                <span *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET' && (wizardForm.value.targetValue === null || wizardForm.value.targetValue === '')">
                  Participants complete this challenge by staying at or below the limit of [Target] {{ derivedUnitLabel }}.
                </span>
              </div>
            </div>
              </div>
            </div>

            <!-- SHARED PREVIEW -->
            <div class="preview-section">
              <div class="preview-card" style="position: sticky; top: 2rem;">
                <h4>Challenge Preview</h4>
                <div class="p-image" [style.backgroundColor]="'#10b981'" style="overflow: hidden; position: relative;">
                  <img *ngIf="imagePreviewUrl" [src]="resolveImageUrl(imagePreviewUrl)" (error)="onImageError()" style="width:100%; height:100%; object-fit:cover; position: absolute; inset: 0;" />
                  <span class="material-icons" *ngIf="!imagePreviewUrl" style="position: relative; z-index: 1;">eco</span>
                </div>
                <h3 class="p-title">{{ wizardForm.value.title || 'Custom Challenge' }}</h3>
                <div class="p-desc-section">
                  <p>{{ wizardForm.value.description || 'Challenge description will appear here.' }}</p>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- STEP 4: REVIEW -->
          <div class="step-content animate-fade-in" *ngIf="currentStep() === 4" style="display: flex; flex-direction: column; align-items: center;">
            <h2 class="step-title" style="text-align: center;">Review Challenge Details</h2>
            <p class="step-subtitle" style="text-align: center;">Please review all the information before publishing.</p>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; width: 100%; max-width: 800px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;">
                <div style="height: 250px; background-color: #10b981; position: relative;">
                  <img *ngIf="imagePreviewUrl" [src]="resolveImageUrl(imagePreviewUrl)" (error)="onImageError()" style="width:100%; height:100%; object-fit:cover; position: absolute; inset: 0;" />
                  <div *ngIf="!imagePreviewUrl" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <span class="material-icons" style="font-size: 6rem; color: rgba(255,255,255,0.8);">eco</span>
                  </div>
                </div>
                
                <div style="padding: 2rem;">
                  <h4 style="margin-top: 0; margin-bottom: 1.5rem; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; font-size: 1.5rem;">{{ wizardForm.value.title || 'Untitled' }}</h4>
                
                  <div class="review-row" style="margin-bottom: 2rem;">
                    <span class="material-icons review-icon">description</span>
                    <div>
                      <small>Description</small>
                      <strong style="white-space: pre-wrap; font-weight: 500;">{{ wizardForm.value.description }}</strong>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">

                <div class="review-row" *ngIf="wizardForm.value.maxParticipants">
                  <span class="material-icons review-icon">group</span>
                  <div>
                    <small>Max Participants</small>
                    <strong>{{ wizardForm.value.maxParticipants }}</strong>
                  </div>
                </div>

                <div class="review-row">
                  <span class="material-icons review-icon">insights</span>
                  <div>
                    <small>Tracking Method</small>
                    <strong>{{ wizardForm.value.trackingMethod === 'AUTOMATIC' ? 'Automatic Tracking' : 'Manual Tracking' }}</strong>
                  </div>
                </div>
                <div class="review-row" *ngIf="wizardForm.value.trackingMethod === 'AUTOMATIC'">
                  <span class="material-icons review-icon">category</span>
                  <div>
                    <small>Tracking Sources</small>
                    <strong *ngIf="resolvedSubcategoryIds.length > 0">{{ selectedSubcategoryNames }}</strong>
                    <strong *ngIf="resolvedSubcategoryIds.length === 0">All supported carbon entries</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">straighten</span>
                  <div>
                    <small>Progress Measurement</small>
                    <strong>{{ wizardForm.value.progressMetric === 'ENTRY_COUNT' ? 'Number of Entries' : (wizardForm.value.progressMetric === 'QUANTITY' ? 'Physical Quantity (' + derivedUnitLabel + ')' : 'Carbon Emissions') }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">rule</span>
                  <div>
                    <small>Evaluation Type</small>
                    <strong>{{ wizardForm.value.challengeEvaluationType === 'ACHIEVEMENT' ? 'Achievement' : 'Budget' }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">track_changes</span>
                  <div>
                    <small>Target Limit/Goal</small>
                    <strong>{{ wizardForm.value.targetValue }} {{ derivedUnitLabel }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">calendar_today</span>
                  <div>
                    <small>Duration</small>
                    <strong>{{ wizardForm.value.startDate | date:'MMM d, y, h:mm a' }} - {{ wizardForm.value.endDate | date:'MMM d, y, h:mm a' }}</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">redeem</span>
                  <div>
                    <small>XP Reward</small>
                    <strong>{{ wizardForm.value.rewardXp || 0 }} XP</strong>
                  </div>
                </div>
                <div class="review-row" *ngIf="wizardForm.value.badgeId">
                  <span class="material-icons review-icon">military_tech</span>
                  <div>
                    <small>Awarded Badge</small>
                    <strong>{{ getBadgeName(wizardForm.value.badgeId) }}</strong>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- PUBLISHING OVERLAY -->
          <div class="step-content animate-fade-in" *ngIf="submitting()" style="position: absolute; inset: 0; background: white; z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <span class="material-icons" style="font-size: 6rem; color: #10b981; margin-bottom: 1.5rem;">rocket_launch</span>
              <h2 style="font-size: 2rem; color: #0f172a; margin-bottom: 1rem;">Publishing Challenge...</h2>
              <p style="color: #64748b;">Please wait while we set up your new challenge.</p>
            </div>
          </div>
          
        </form>

        <!-- WIZARD FOOTER -->
        <div class="wizard-footer">
          <button class="btn-cancel" *ngIf="currentStep() === 1" (click)="cancel()">Cancel</button>
          <button class="btn-cancel" *ngIf="currentStep() > 1 && !submitting()" (click)="prevStep()">
            <span class="material-icons" style="font-size: 18px; margin-right: 4px;">arrow_back</span> Back
          </button>
          
          <div class="spacer"></div>
          
          <button class="btn-next" *ngIf="currentStep() < 4 && !submitting()" (click)="nextStep()">
            Next <span class="material-icons" style="font-size: 18px; margin-left: 4px;">arrow_forward</span>
          </button>
          
          <button class="btn-next" *ngIf="currentStep() === 4 && !submitting()" [disabled]="!canSubmit()" (click)="submit()">
            Publish Challenge
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
      margin-bottom: 1.5rem; max-width: 1200px; margin-left: auto; margin-right: auto; display: flex; justify-content: space-between; align-items: center; position: relative;
    }
    .back-link {
      background: none; border: none; font-size: 1rem; font-weight: 600; color: #0f172a; 
      display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0;
    }
    .back-link .material-icons { color: #10b981; font-size: 1.25rem; }
    
    .wizard-main-container {
      background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
      max-width: 1200px; margin: 0 auto; overflow: hidden; display: flex; flex-direction: column; position: relative;
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
    .step-label { font-size: 0.8125rem; font-weight: 600; color: #0f172a; text-align: center; max-width: 80px; }
    .step:not(.active):not(.completed) .step-label { color: #64748b; font-weight: 500; }
    
    .step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 1rem; position: relative; top: -16px; }
    .step-line.completed { background: #10b981; }

    /* CONTENT AREAS */
    .step-content { padding: 2.5rem 4rem; flex: 1; }
    .step-title { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: #0f172a; font-weight: 700; }
    .step-subtitle { color: #64748b; font-size: 0.9375rem; margin-bottom: 2rem; }
    
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* STEP 1 SPLIT LAYOUT */
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
    .premium-input[aria-invalid="true"] { border-color: #ef4444; box-shadow: 0 0 0 3px #fef2f2; }
    .premium-input[aria-invalid="true"]:focus { border-color: #ef4444; box-shadow: 0 0 0 3px #fef2f2; }
    .validation-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.35rem; font-weight: 500; display: block; }
    
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
    .btn-next:disabled { opacity: 0.7; cursor: not-allowed; background: #94a3b8; }
    
    .tracking-card {
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; gap: 1rem; cursor: pointer; transition: 0.2s;
    }
    .tracking-card:focus { outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4); }
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
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  currentStep = signal<number>(1);
  submitting = signal<boolean>(false);
  isSaved = false;
  isDuplicating = false;
  isEditMode = false;
  isTemplate = false;
  editChallengeId: number | null = null;
  originalName = '';
  
  templateDataRef: any = null;
  resolvedSubcategoryIds: number[] = [];
  activeTrackingSources: TrackingSourceCode[] = [];
  
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  
  automaticCategories = signal<CarbonCategory[]>([]);
  allSubcategories: CarbonSubcategory[] = [];
  challengeBadges: AdminBadge[] = [];
  
  multiSourceFilterCategoryId: number | 'ALL' = 'ALL';

  wizardForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    challengeEvaluationType: ['ACHIEVEMENT', [Validators.required]],
    progressMetric: ['ENTRY_COUNT', [Validators.required]],
    trackingMethod: ['AUTOMATIC', [Validators.required]],
    approvalRequired: [false],
    submissionType: ['PHOTO/TEXT'],
    evidenceRequired: [false],
    targetValue: [100, [Validators.required, Validators.min(0)]],
    rewardXp: [250, [Validators.required, Validators.min(0)]],
    startDate: ['', [Validators.required]],
    durationDays: [null, [Validators.min(1)]],
    endDate: ['', [Validators.required]],
    maxParticipants: [''],
    badgeId: [null]
  });

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state;
    if (state && state['duplicateData']) {
      this.isDuplicating = true;
      this.originalName = state['originalName'];
      
      setTimeout(() => {
        this.wizardForm.patchValue(state['duplicateData']);
      });
    } else if (nav?.extras.state?.['templateData']) {
      this.isTemplate = true;
      this.templateDataRef = nav.extras.state['templateData'];
      this.activeTrackingSources = [...(this.templateDataRef.trackingSources || [])];
      
      if (this.templateDataRef.imageUrl) {
        this.imagePreviewUrl = this.templateDataRef.imageUrl;
      }
      
      setTimeout(() => {
        const mappedProgressMetric = this.templateDataRef.progressMetric || 'ENTRY_COUNT';
        
        const duration = this.templateDataRef.durationDays || this.templateDataRef.rulesConfig?.durationDays || 7;
        const now = new Date();
        const end = new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000));

        this.wizardForm.patchValue({
           ...this.templateDataRef,
           targetValue: this.templateDataRef.goalTarget ?? this.templateDataRef.targetValue ?? 100,
           rewardXp: this.templateDataRef.rewardXP ?? this.templateDataRef.rewardXp ?? 250,
           progressMetric: mappedProgressMetric,
           durationDays: duration,
           startDate: this.formatDateTimeLocal(now),
           endDate: this.formatDateTimeLocal(end)
        });
        
        if (this.templateDataRef?.rulesConfig) {
           this.wizardForm.patchValue(this.templateDataRef.rulesConfig);
        }
        this.wizardForm.markAllAsTouched();
      });
    }
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return encodeURI(url);
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    if (url.startsWith('uploads/')) {
      return encodeURI(`${baseUrl}/${url}`);
    }
    return encodeURI(`${baseUrl}/uploads/${url}`);
  }

  onImageError(): void {
    this.imagePreviewUrl = null;
    this.cdr.markForCheck();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  get minDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateTimeLocal(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private route = inject(ActivatedRoute);
  private trackingMapper = inject(TemplateTrackingMapperService);

  ngOnInit() {
    this.wizardForm.get('startDate')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      if (val && this.wizardForm.get('durationDays')?.value) {
         const days = this.wizardForm.get('durationDays')?.value;
         let d = new Date(val);
         if (val.length === 10) { 
             d.setHours(0, 0, 0, 0); 
         }
         d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
         this.wizardForm.patchValue({ endDate: this.formatDateTimeLocal(d) }, { emitEvent: false });
      }
    });

    this.wizardForm.get('durationDays')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(days => {
      const startVal = this.wizardForm.get('startDate')?.value;
      if (startVal && days) {
         let d = new Date(startVal);
         d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
         this.wizardForm.patchValue({ endDate: this.formatDateTimeLocal(d) }, { emitEvent: false });
      }
    });

    this.wizardForm.get('endDate')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(endVal => {
       const startVal = this.wizardForm.get('startDate')?.value;
       if (startVal && endVal) {
          const s = new Date(startVal);
          const e = new Date(endVal);
          const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24));
          if (diffDays > 0) {
             this.wizardForm.patchValue({ durationDays: diffDays }, { emitEvent: false });
          }
       }
    });

    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.automaticCategories.set(cats);
      this.allSubcategories = cats.flatMap((c: any) => c.subCategories || c.subcategories || []);

      if (this.isTemplate) {
        if (this.templateDataRef?.trackingSources && this.templateDataRef.trackingSources.length > 0) {
          this.resolvedSubcategoryIds = this.trackingMapper.resolveAllowedSubcategoryIds(
            this.templateDataRef.trackingSources,
            cats
          );
          if (this.resolvedSubcategoryIds.length > 0) {
            const firstSubId = this.resolvedSubcategoryIds[0];
            const parentCat = cats.find(c => (c.subcategories || (c as any).subCategories || []).some((s: any) => s.id === firstSubId));
            if (parentCat) {
              this.multiSourceFilterCategoryId = parentCat.id.toString() as any;
            }
          }
        } else if (this.templateDataRef?.progressMetric === 'CARBON_EMISSION') {
          this.resolvedSubcategoryIds = this.allSubcategories.map(s => s.id);
        }
      } else if (!this.isEditMode && !this.isTemplate) {
        // Create mode: blank tracking sources
        this.resolvedSubcategoryIds = [];
      }
      this.cdr.markForCheck();
    });

    // Fetch challenge badges
    this.adminService.getAdminBadges(0, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.challengeBadges = response.content.filter((b: AdminBadge) => b.type === 'CHALLENGE' && !b.isHidden);
        this.cdr.markForCheck();
      }
    });

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
        const rules: any = challenge.rulesConfig || {};
        if (rules.allowedSubcategoryIds) {
          this.resolvedSubcategoryIds = rules.allowedSubcategoryIds;
        }
        
        const formData = {
          title: challenge.title,
          description: challenge.description,
          challengeEvaluationType: challenge.challengeEvaluationType || 'ACHIEVEMENT',
          rewardXp: challenge.rewardXp,
          progressMetric: challenge.progressMetric,
          trackingMethod: challenge.trackingMethod,
          approvalRequired: rules.approvalRequired || false,
          submissionType: rules.submissionType || 'PHOTO/TEXT',
          evidenceRequired: rules.evidenceRequired || false,
          targetValue: challenge.targetValue,
          startDate: challenge.startDate ? challenge.startDate.split('T')[0] : '',
          endDate: challenge.endDate ? challenge.endDate.split('T')[0] : '',
          maxParticipants: challenge.participantCount || '',
          badgeId: challenge.badge?.id || null
        };
        this.wizardForm.patchValue(formData);
        this.wizardForm.markAllAsTouched();
        
        if (challenge.imageUrl) {
          this.imagePreviewUrl = challenge.imageUrl;
        }
      },
      error: () => {
        this.toast.error('Failed to load challenge for editing.');
        this.router.navigate(['/admin/challenges']);
      }
    });
  }

  toggleSubcategoryId(id: number) {
    if (this.isTemplate) return;
    const idx = this.resolvedSubcategoryIds.indexOf(id);
    if (idx > -1) {
      this.resolvedSubcategoryIds.splice(idx, 1);
    } else {
      this.resolvedSubcategoryIds.push(id);
    }
  }

  getFilteredSubcategories(): CarbonSubcategory[] {
    if (this.multiSourceFilterCategoryId === 'ALL') {
      return this.allSubcategories;
    }
    const cat = this.automaticCategories().find(c => c.id == this.multiSourceFilterCategoryId);
    return (cat as any)?.subCategories || (cat as any)?.subcategories || [];
  }

  get unitConflictWarning(): boolean {
    if (this.wizardForm.get('progressMetric')?.value !== 'QUANTITY') {
      return false;
    }
    if (this.resolvedSubcategoryIds.length <= 1) {
      return false;
    }
    
    // Find all selected subcategories
    const selectedSubs = this.allSubcategories.filter(s => this.resolvedSubcategoryIds.includes(s.id));
    if (selectedSubs.length === 0) return false;
    
    // Get their default_unit (might be mapped from backend as defaultUnit)
    const firstUnit = (selectedSubs[0] as any).default_unit || (selectedSubs[0] as any).defaultUnit || '';
    
    for (const sub of selectedSubs) {
      const u = (sub as any).default_unit || (sub as any).defaultUnit || '';
      if (u !== firstUnit) {
        return true;
      }
    }
    return false;
  }

  get derivedUnitLabel(): string {
    const metric = this.wizardForm.get('progressMetric')?.value;
    
    if (metric === 'CARBON_EMISSION') {
      return 'kgCO2e';
    }
    
    if (metric === 'ENTRY_COUNT') {
      return 'entries';
    }
    
    if (metric === 'QUANTITY') {
      if (this.resolvedSubcategoryIds.length > 0) {
        const firstSelected = this.allSubcategories.find(s => s.id === this.resolvedSubcategoryIds[0]);
        if (firstSelected) {
          const u = (firstSelected as any).default_unit || (firstSelected as any).defaultUnit;
          if (u) return u;
        }
      }
      return 'units';
    }
    
    return 'units';
  }

  get selectedSubcategoryNames(): string {
    if (this.resolvedSubcategoryIds.length === 0) return '';
    const selectedSubs = this.allSubcategories.filter(s => this.resolvedSubcategoryIds.includes(s.id));
    return selectedSubs.map(s => s.name).join(', ');
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
      const step1Fields = ['title', 'description', 'startDate', 'endDate'];
      const isValid = step1Fields.every(f => this.wizardForm.get(f)?.valid ?? true);
      if (isValid) {
        this.currentStep.set(2);
      } else {
        step1Fields.forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please fill required fields in Basic Info.');
      }
    } else if (this.currentStep() === 2) {
      const step2Fields = ['trackingMethod', 'progressMetric'];
      const isValid = step2Fields.every(f => this.wizardForm.get(f)?.valid ?? true);
      
      const trackingMethod = this.wizardForm.get('trackingMethod')?.value;
      const progressMetric = this.wizardForm.get('progressMetric')?.value;
      
      if (trackingMethod === 'AUTOMATIC' && progressMetric !== 'CARBON_EMISSION' && this.resolvedSubcategoryIds.length === 0) {
        this.toast.error('Please select at least one tracking source for Automatic tracking.');
        return;
      }
      
      if (this.unitConflictWarning) {
        this.toast.error('Cannot proceed with conflicting units in Physical Quantity tracking.');
        return;
      }
      
      if (isValid) {
        this.currentStep.set(3);
      } else {
        step2Fields.forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please complete tracking configuration correctly.');
      }
    } else if (this.currentStep() === 3) {
      const step3Fields = ['challengeEvaluationType', 'targetValue', 'rewardXp'];
      const isValid = step3Fields.every(f => this.wizardForm.get(f)?.valid ?? true);
      
      const evalType = this.wizardForm.get('challengeEvaluationType')?.value;
      const target = this.wizardForm.get('targetValue')?.value;
      
      if (evalType === 'ACHIEVEMENT' && target === 0) {
        this.toast.error('Achievement challenges must have a target greater than 0.');
        return;
      }
      
      if (isValid) {
        this.currentStep.set(4);
      } else {
        step3Fields.forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please complete evaluation configuration correctly.');
      }
    }
  }

  prevStep() {
    this.currentStep.set(this.currentStep() - 1);
  }

  cancel() {
    this.isSaved = true;
    if (this.isEditMode && this.editChallengeId) {
      this.router.navigate(['/admin/challenges', this.editChallengeId]);
    } else {
      this.router.navigate(['/admin/challenges/create']);
    }
  }
  
  canSubmit(): boolean {
    if (this.wizardForm.invalid) return false;
    
    const trackingMethod = this.wizardForm.get('trackingMethod')?.value;
    const progressMetric = this.wizardForm.get('progressMetric')?.value;
    if (trackingMethod === 'AUTOMATIC' && progressMetric !== 'CARBON_EMISSION' && this.resolvedSubcategoryIds.length === 0) {
      return false;
    }
    
    if (this.unitConflictWarning) return false;
    
    const evalType = this.wizardForm.get('challengeEvaluationType')?.value;
    const target = this.wizardForm.get('targetValue')?.value;
    if (evalType === 'ACHIEVEMENT' && target === 0) return false;
    
    return true;
  }

  submit() {
    if (!this.canSubmit()) {
      this.toast.error('Please review your configuration for errors.');
      return;
    }
    this.submitting.set(true);
    const formValue = this.wizardForm.value;

    const request: ChallengeRequest = {
      title: formValue.title,
      description: formValue.description,
      challengeEvaluationType: formValue.challengeEvaluationType,
      progressMetric: formValue.progressMetric,
      trackingMethod: formValue.trackingMethod,
      targetValue: Number(formValue.targetValue),
      rewardXp: Number(formValue.rewardXp),
      startDate: this.formatStartDate(formValue.startDate),
      endDate: formValue.endDate.includes('T') ? formValue.endDate : formValue.endDate + 'T23:59:59',
      rulesConfig: formValue.trackingMethod === 'MANUAL' ? {
        approvalRequired: formValue.approvalRequired,
        submissionType: formValue.submissionType,
        evidenceRequired: formValue.evidenceRequired,
        ...(this.templateDataRef?.rulesConfig || {})
      } : {
        ...(this.templateDataRef?.rulesConfig || {}),
        allowedSubcategoryIds: this.resolvedSubcategoryIds
      },
      imageUrl: this.templateDataRef?.imageUrl || null,
      badgeId: formValue.badgeId || null
    };

    if (this.isEditMode && this.editChallengeId) {
      this.challengeService.updateChallenge(this.editChallengeId, request).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (challenge) => {
          if (this.selectedImageFile) {
            this.challengeService.uploadImage(challenge.id, this.selectedImageFile).subscribe({
              next: () => this.finalizeSubmit(challenge.id),
              error: () => {
                this.toast.error('Challenge updated but image upload failed.');
                this.finalizeSubmit(challenge.id);
              }
            });
          } else {
            this.finalizeSubmit(challenge.id);
          }
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
        next: (challenge) => {
          if (this.selectedImageFile) {
            this.challengeService.uploadImage(challenge.id, this.selectedImageFile).subscribe({
              next: () => this.finalizeSubmit(challenge.id),
              error: () => {
                this.toast.error('Challenge created but image upload failed.');
                this.finalizeSubmit(challenge.id);
              }
            });
          } else {
            this.finalizeSubmit(challenge.id);
          }
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Failed to create Challenge.');
        }
      });
    }
  }

  private finalizeSubmit(id: number) {
    this.isSaved = true;
    this.toast.success(this.isEditMode ? 'Challenge updated successfully!' : 'Challenge launched successfully!');
    if (this.isEditMode) {
      this.router.navigate(['/admin/challenges', id]);
    } else {
      this.router.navigate(['/admin/challenges/library']);
    }
  }

  private formatStartDate(dateStr: string): string {
    if (dateStr.includes('T')) return dateStr;
    return `${dateStr}T00:00:00`;
  }

  getBadgeName(badgeId: number): string {
    const badge = this.challengeBadges.find(b => b.id === badgeId);
    return badge ? `${badge.name} (${badge.rarity})` : 'Unknown Badge';
  }
}
