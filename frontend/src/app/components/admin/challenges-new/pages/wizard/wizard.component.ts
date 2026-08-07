import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ChallengeRequest } from '../../../../../models/challenge.models';
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
                <div class="validation-error" *ngIf="isInvalid('title')">Challenge name is required and must be at least 5 characters.</div>
              </div>




              <div class="form-group">
                <label for="description">Short Description <span class="required">*</span></label>
                <textarea id="description" class="premium-input" formControlName="description" rows="3" [attr.aria-invalid]="isInvalid('description')"></textarea>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="validation-error" *ngIf="isInvalid('description')">Description is required.</div>
                  <div class="char-count" style="margin-left: auto;">{{ wizardForm.get('description')?.value?.length || 0 }} / 2000</div>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label for="startDate">Start Date <span class="required">*</span></label>
                  <input id="startDate" type="date" class="premium-input icon-right" formControlName="startDate" [attr.aria-invalid]="isInvalid('startDate')" [min]="minDate" />
                  <div class="validation-error" *ngIf="isInvalid('startDate')">Valid start date is required.</div>
                </div>
                <div class="form-group">
                  <label for="endDate">End Date <span class="required">*</span></label>
                  <input id="endDate" type="date" class="premium-input icon-right" formControlName="endDate" [attr.aria-invalid]="isInvalid('endDate')" [min]="wizardForm.get('startDate')?.value || minDate" />
                  <div class="validation-error" *ngIf="isInvalid('endDate')">Valid end date is required.</div>
                </div>
              </div>
              
              <div class="form-group">
                <label>Cover Image <span class="required">*</span></label>
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

            <div class="preview-section">
              <div class="preview-card">
                <h4>Challenge Preview</h4>
                <div class="p-image" [style.backgroundColor]="'#10b981'" style="overflow: hidden; position: relative;">
                  <img *ngIf="imagePreviewUrl" [src]="resolveImageUrl(imagePreviewUrl)" (error)="onImageError()" style="width:100%; height:100%; object-fit:cover; position: absolute; inset: 0;" />
                  <span class="material-icons" *ngIf="!imagePreviewUrl" style="position: relative; z-index: 1;">eco</span>
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
                      <strong>General</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">emoji_events</span>
                    <div class="p-text">
                      <small>Default XP Reward</small>
                      <strong>{{ wizardForm.value.rewardXp || 0 }} XP</strong>
                    </div>
                  </div>
                  <div class="p-item" *ngIf="wizardForm.value.startDate && wizardForm.value.endDate">
                    <span class="material-icons">schedule</span>
                    <div class="p-text">
                      <small>Duration</small>
                      <strong>{{ calculateDuration(wizardForm.value.startDate, wizardForm.value.endDate) }} Days</strong>
                    </div>
                  </div>
                  <div class="p-item">
                    <span class="material-icons">flag</span>
                    <div class="p-text">
                      <small>Goal Target</small>
                      <strong>{{ wizardForm.value.targetValue }}</strong>
                    </div>
                  </div>
                  <div class="p-item" *ngIf="isTemplate && templateDataRef?.difficulty">
                    <span class="material-icons">assessment</span>
                    <div class="p-text">
                      <small>Difficulty</small>
                      <strong>{{ templateDataRef?.difficulty }}</strong>
                    </div>
                  </div>
                  <div class="p-item" *ngIf="isTemplate && templateDataRef?.estimatedCarbonImpact">
                    <span class="material-icons" style="color: #10b981;">eco</span>
                    <div class="p-text">
                      <small>Est. Carbon Impact</small>
                      <strong style="color: #10b981;">{{ templateDataRef?.estimatedCarbonImpact }}kg CO₂</strong>
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
                
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9375rem; color: #0f172a; font-weight: 600;">Tracking Configuration</h4>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                  <button type="button" 
                          [style.background]="autoTrackingMode === 'SINGLE' ? '#10b981' : '#f1f5f9'"
                          [style.color]="autoTrackingMode === 'SINGLE' ? 'white' : '#64748b'"
                          [style.border]="'none'" [style.padding]="'0.5rem 1rem'" [style.borderRadius]="'6px'" [style.cursor]="'pointer'" [style.fontWeight]="'600'"
                          (click)="setAutoTrackingMode('SINGLE')">
                    Single Category
                  </button>
                  <button type="button" 
                          [style.background]="autoTrackingMode === 'MULTI' ? '#10b981' : '#f1f5f9'"
                          [style.color]="autoTrackingMode === 'MULTI' ? 'white' : '#64748b'"
                          [style.border]="'none'" [style.padding]="'0.5rem 1rem'" [style.borderRadius]="'6px'" [style.cursor]="'pointer'" [style.fontWeight]="'600'"
                          (click)="setAutoTrackingMode('MULTI')">
                    Multi-Source Tracking
                  </button>
                </div>

                <ng-container *ngIf="autoTrackingMode === 'SINGLE'">
                  <p style="font-size: 0.8125rem; color: #64748b; margin-bottom: 1rem;">Select a single category. All subcategories under it will be automatically tracked.</p>
                  <select class="premium-input" formControlName="linkedCategoryId" style="max-width: 400px;">
                    <option *ngFor="let cat of automaticCategories()" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </ng-container>

                <ng-container *ngIf="autoTrackingMode === 'MULTI'">
                  <p style="font-size: 0.8125rem; color: #64748b; margin-bottom: 1rem;">Select specific tracking sources (subcategories) to aggregate progress for this challenge.</p>
                  
                  <div style="margin-bottom: 1rem;">
                    <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Filter by Category</label>
                    <select class="premium-input" style="max-width: 400px;" [value]="multiSourceFilterCategoryId" (change)="multiSourceFilterCategoryId = $any($event.target).value">
                      <option value="ALL">All Categories</option>
                      <option *ngFor="let cat of automaticCategories()" [value]="cat.id">{{ cat.name }}</option>
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
                </ng-container>
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
              <div style="display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1rem;">
                <div style="flex: 1;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.5rem; display: block;">Evaluation Type</label>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
                    <!-- Achievement Card -->
                    <div class="tracking-card" [class.active]="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'" 
                         (click)="wizardForm.patchValue({challengeEvaluationType: 'ACHIEVEMENT'})">
                      <div class="tc-icon-wrapper" style="background: #e0f2fe; color: #0284c7;">
                        <span class="material-icons tc-icon">emoji_events</span>
                      </div>
                      <div class="tc-content">
                        <h5>Achievement Challenge</h5>
                        <div style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                          <div style="display: flex; align-items: center; gap: 0.25rem;"><span class="material-icons" style="font-size: 1rem; color: #10b981;">check_circle</span> User reaches a target</div>
                          <div style="display: flex; align-items: center; gap: 0.25rem; margin-top: 0.125rem;"><span class="material-icons" style="font-size: 1rem; color: #10b981;">check_circle</span> Completes immediately</div>
                        </div>
                      </div>
                      <div class="tc-radio">
                        <span class="material-icons" *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'ACHIEVEMENT'">check_circle</span>
                      </div>
                    </div>
                    
                    <!-- Budget Card -->
                    <div class="tracking-card" [class.active]="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET'" 
                         (click)="wizardForm.patchValue({challengeEvaluationType: 'BUDGET'})">
                      <div class="tc-icon-wrapper" style="background: #fef9c3; color: #ca8a04;">
                        <span class="material-icons tc-icon">account_balance_wallet</span>
                      </div>
                      <div class="tc-content">
                        <h5>Budget Challenge</h5>
                        <div style="font-size: 0.8125rem; color: #64748b; margin-top: 0.25rem;">
                          <div style="display: flex; align-items: center; gap: 0.25rem;"><span class="material-icons" style="font-size: 1rem; color: #10b981;">check_circle</span> User stays below a limit</div>
                          <div style="display: flex; align-items: center; gap: 0.25rem; margin-top: 0.125rem;"><span class="material-icons" style="font-size: 1rem; color: #10b981;">check_circle</span> Evaluated when challenge ends</div>
                        </div>
                      </div>
                      <div class="tc-radio">
                        <span class="material-icons" *ngIf="wizardForm.get('challengeEvaluationType')?.value === 'BUDGET'">check_circle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 1rem; align-items: flex-end;">
                <div style="flex: 2;" [style.opacity]="isTemplate ? '0.6' : '1'" [style.pointer-events]="isTemplate ? 'none' : 'auto'">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Goal Type</label>
                  <select class="premium-input" formControlName="progressMetric">
                    <option value="COUNT">Count (e.g. 10 actions)</option>
                    <option value="AMOUNT">{{ amountLabel }}</option>
                  </select>
                </div>
                <div style="flex: 1; position: relative;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">Target {{ amountLabel }} <span class="required">*</span></label>
                  <input type="number" class="premium-input" formControlName="targetValue" [attr.aria-invalid]="isInvalid('targetValue')" />
                  <div class="validation-error" *ngIf="isInvalid('targetValue')" style="position: absolute; bottom: -20px; white-space: nowrap;">Valid target required.</div>
                </div>
                
                <div style="flex: 1; position: relative;">
                  <label style="font-size: 0.8125rem; color: #64748b; margin-bottom: 0.25rem; display: block;">XP Reward <span class="required">*</span></label>
                  <input type="number" class="premium-input" formControlName="rewardXp" [attr.aria-invalid]="isInvalid('rewardXp')" />
                  <div class="validation-error" *ngIf="isInvalid('rewardXp')" style="position: absolute; bottom: -20px; white-space: nowrap;">Valid XP required.</div>
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
                    <strong>Not set</strong>
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
                    <strong>{{ wizardForm.value.targetValue || 0 }} ({{ wizardForm.value.progressMetric }})</strong>
                  </div>
                </div>
                <div class="review-row">
                  <span class="material-icons review-icon">rule</span>
                  <div>
                    <small>Evaluation Type</small>
                    <strong>{{ wizardForm.value.challengeEvaluationType }}</strong>
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
                <div class="p-image" [style.background]="imagePreviewUrl ? 'url(' + resolveImageUrl(imagePreviewUrl) + ') center/cover no-repeat' : '#10b981'">
                  <span class="material-icons" style="font-size: 4rem; color: white;" *ngIf="!imagePreviewUrl">eco</span>
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
  
  autoTrackingMode: 'SINGLE' | 'MULTI' = 'SINGLE';
  multiSourceFilterCategoryId: number | 'ALL' = 'ALL';

  wizardForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    
    linkedCategoryId: [null],
    carbonCategoryCode: [null],
    challengeEvaluationType: ['ACHIEVEMENT', [Validators.required]],
    progressMetric: ['ENTRY_COUNT', [Validators.required]],
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
        this.onTrackingMethodChange();
      });
    } else if (nav?.extras.state?.['templateData']) {
      this.isTemplate = true;
      this.templateDataRef = nav.extras.state['templateData'];
      this.activeTrackingSources = [...(this.templateDataRef.trackingSources || [])];
      if (this.activeTrackingSources.length > 0) {
        this.autoTrackingMode = 'MULTI';
      }
      if (this.templateDataRef.imageUrl) {
        this.imagePreviewUrl = this.templateDataRef.imageUrl;
      }
      // Prefill with template data
      setTimeout(() => {
        let mappedProgressMetric = 'ENTRY_COUNT';
        if (this.templateDataRef.goalType && this.templateDataRef.goalType !== 'COUNT' && this.templateDataRef.goalType !== 'TRIPS') {
            mappedProgressMetric = 'QUANTITY';
        }
        
        this.wizardForm.patchValue({
           ...this.templateDataRef,
           targetValue: this.templateDataRef.goalTarget,
           rewardXp: this.templateDataRef.rewardXP,
           progressMetric: mappedProgressMetric
        });
        
        if (this.templateDataRef?.rulesConfig) {
           this.wizardForm.patchValue(this.templateDataRef.rulesConfig);
        }
        this.wizardForm.markAllAsTouched();
        this.onTrackingMethodChange();
        this.syncTrackingCategory();
      });
    }
  }

  private syncTrackingCategory() {
    const cats = this.automaticCategories();
    const code = this.wizardForm.get('carbonCategoryCode')?.value;
    if (code && cats.length > 0) {
      const cat = cats.find(c => c.code === code);
      if (cat) {
        this.wizardForm.patchValue({ linkedCategoryId: cat.id });
      }
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
    return `${year}-${month}-${day}`;
  }

  calculateDuration(start: string, end: string): number {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private route = inject(ActivatedRoute);

  private trackingMapper = inject(TemplateTrackingMapperService);

  ngOnInit() {
    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.automaticCategories.set(cats);
      this.allSubcategories = cats.flatMap((c: any) => c.subCategories || c.subcategories || []);
      this.syncTrackingCategory();

      if (this.isTemplate && this.templateDataRef?.id === 'carbon-reduction') {
        this.resolvedSubcategoryIds = this.allSubcategories.map(s => s.id);
      } else if (this.isTemplate && this.templateDataRef?.trackingSources && this.templateDataRef.trackingSources.length > 0) {
        this.resolvedSubcategoryIds = this.trackingMapper.resolveAllowedSubcategoryIds(
          this.templateDataRef.trackingSources,
          cats
        );
        if (this.resolvedSubcategoryIds.length === 0) {
          this.toast.error('Warning: Could not resolve tracking sources for this template.');
        }
      } else if (!this.isEditMode) {
        this.resolvedSubcategoryIds = this.allSubcategories.map(s => s.id);
      }
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
        const rules: any = challenge.rulesConfig || {};
        const formData = {
          title: challenge.title,
          description: challenge.description,
          
          linkedCategoryId: challenge.linkedCategoryId,
          carbonCategoryCode: challenge.carbonCategoryCode,
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
          maxParticipants: challenge.participantCount || ''
        };
        this.wizardForm.patchValue(formData);
        this.wizardForm.markAllAsTouched();
        this.onTrackingMethodChange();
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

  setAutoTrackingMode(mode: 'SINGLE' | 'MULTI') {
    this.autoTrackingMode = mode;
    this.onTrackingMethodChange();
  }

  onTrackingMethodChange() {
    const trackingMethod = this.wizardForm.get('trackingMethod')?.value;
    if (trackingMethod === 'MANUAL' || this.autoTrackingMode === 'MULTI') {
      this.wizardForm.get('linkedCategoryId')?.clearValidators();
      this.wizardForm.get('linkedCategoryId')?.setValue(null);
    } else {
      this.wizardForm.get('linkedCategoryId')?.setValidators([Validators.required]);
    }
    this.wizardForm.get('linkedCategoryId')?.updateValueAndValidity();
  }

  toggleTrackingSource(source: string) {
    const src = source as TrackingSourceCode;
    const idx = this.activeTrackingSources.indexOf(src);
    if (idx > -1) {
      this.activeTrackingSources.splice(idx, 1);
    } else {
      this.activeTrackingSources.push(src);
    }
    
    this.recalculateResolvedIds();
  }

  toggleSubcategoryId(id: number) {
    const idx = this.resolvedSubcategoryIds.indexOf(id);
    if (idx > -1) {
      this.resolvedSubcategoryIds.splice(idx, 1);
    } else {
      this.resolvedSubcategoryIds.push(id);
    }
  }

  private recalculateResolvedIds() {
    // Recompute resolved ids for the backend based on string codes
    if (this.activeTrackingSources.length > 0) {
      this.resolvedSubcategoryIds = this.trackingMapper.resolveAllowedSubcategoryIds(
        this.activeTrackingSources,
        this.automaticCategories()
      );
    } else {
      this.resolvedSubcategoryIds = [];
    }
  }

  getFilteredSubcategories(): CarbonSubcategory[] {
    if (this.multiSourceFilterCategoryId === 'ALL') {
      return this.allSubcategories;
    }
    const cat = this.automaticCategories().find(c => c.id == this.multiSourceFilterCategoryId);
    return (cat as any)?.subCategories || (cat as any)?.subcategories || [];
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
      const step2Fields = ['progressMetric', 'trackingMethod', 'targetValue', 'rewardXp', 'linkedCategoryId', 'challengeEvaluationType'];
      const isValid = step2Fields.every(f => this.wizardForm.get(f)?.valid ?? true);
      if (isValid) {
        this.currentStep.set(3);
      } else {
        step2Fields.forEach(f => this.wizardForm.get(f)?.markAsTouched());
        this.toast.error('Please complete goal configuration correctly.');
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
      this.wizardForm.markAllAsTouched();
      const step1Fields = ['title', 'description', 'startDate', 'endDate'];
      const step2Fields = ['trackingMethod', 'linkedCategoryId', 'challengeEvaluationType', 'progressMetric', 'targetValue', 'rewardXp'];
      if (step1Fields.some(f => this.wizardForm.get(f)?.invalid)) {
        this.currentStep.set(1);
        this.toast.error('Please correct the errors in Basic Info.');
        return;
      }
      if (step2Fields.some(f => this.wizardForm.get(f)?.invalid)) {
        this.currentStep.set(2);
        this.toast.error('Please correct the errors in Tracking & Goal.');
        return;
      }
      this.toast.error('Please correct the errors in the form.');
      return;
    }
    this.submitting.set(true);
    const formValue = this.wizardForm.value;
    let carbonCode = formValue.carbonCategoryCode;
    if (formValue.trackingMethod === 'AUTOMATIC' && this.autoTrackingMode === 'SINGLE' && formValue.linkedCategoryId) {
      const cat = this.automaticCategories().find(c => c.id == formValue.linkedCategoryId);
      if (cat) carbonCode = cat.code;
    }

    const request: ChallengeRequest = {
      title: formValue.title,
      description: formValue.description,
      
      linkedCategoryId: formValue.trackingMethod === 'AUTOMATIC' && this.autoTrackingMode === 'SINGLE' ? Number(formValue.linkedCategoryId) : undefined,
      carbonCategoryCode: carbonCode,
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
        allowedSubcategoryIds: this.autoTrackingMode === 'MULTI' ? this.resolvedSubcategoryIds : []
      },
      imageUrl: this.templateDataRef?.imageUrl || null
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

  get amountLabel(): string {
    const trackingMethod = this.wizardForm.get('trackingMethod')?.value;
    if (trackingMethod === 'AUTOMATIC') {
      const linkedId = this.wizardForm.get('linkedCategoryId')?.value;
      const cats = this.automaticCategories();
      const selectedCat = cats.find(c => c.id == linkedId);
      const code = selectedCat?.code || this.wizardForm.get('carbonCategoryCode')?.value;
      
      switch (code) {
        case 'TRANSPORTATION': return 'Amount (e.g. 50 km)';
        case 'WATER': return 'Amount (e.g. 50 liters)';
        case 'WASTE': return 'Amount (e.g. 10 kg)';
        case 'FOOD': return 'Amount (e.g. 5 kg)';
        case 'ELECTRICITY': return 'Amount (e.g. 100 kWh)';
        case 'SHOPPING': return 'Amount (e.g. 5 items)';
        default: return 'Amount (e.g. 50 units)';
      }
    }
    return 'Amount (e.g. 50 kg CO2)';
  }
}


