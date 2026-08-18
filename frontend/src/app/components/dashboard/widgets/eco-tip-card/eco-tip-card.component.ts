import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { EcoTipResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { LucideAngularModule, Lightbulb, Zap, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-eco-tip-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AiSkeletonLineComponent, AiEmptyHintComponent, LucideAngularModule],
  template: `
    <div class="card-premium border-0 rounded-4 shadow-sm d-flex flex-column overflow-hidden position-relative group" 
         style="background: color-mix(in srgb, var(--color-emerald) 8%, var(--bg-surface)); backdrop-filter: blur(10px); border-left: 4px solid #0d9488 !important;">
      
      <div class="p-2 px-3 d-flex flex-column position-relative z-1">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="fw-bold text-teal text-uppercase tracking-wider fs-xs mb-0 d-flex align-items-center gap-2">
            <span class="text-teal d-flex"><lucide-angular [img]="CalendarIcon" size="16"></lucide-angular></span>
            Today's Eco Tip
          </h6>
          <span class="fs-xs fw-medium d-flex align-items-center gap-1 px-2 py-1 rounded-pill border shadow-sm eco-tip-badge" style="color: #6366f1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"></path>
              <path d="M7 16l2.5-7 2.5 7"></path>
              <path d="M8.5 13.5h3"></path>
              <path d="M14 16v-4"></path>
              <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none"></circle>
              <path d="M18 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor" stroke="none"></path>
            </svg>
            AI Generated
          </span>
        </div>

        <div *ngIf="state.loading" class="flex-grow-1">
          <app-ai-skeleton-line [lines]="3"></app-ai-skeleton-line>
        </div>
        
        <div *ngIf="state.error" class="flex-grow-1 text-center py-2">
          <app-ai-empty-hint title="AI Tip Unavailable" [message]="state.error"></app-ai-empty-hint>
        </div>
        
        <div *ngIf="state.data" class="flex-grow-1 d-flex flex-column pt-1">
          <div *ngIf="state.data.relatedCategory" class="mb-2">
            <span class="fw-bold text-dark text-uppercase fs-xs tracking-wider opacity-75">{{ state.data.relatedCategory }}</span>
          </div>

          <p class="fs-5 text-dark fw-medium lh-base mb-0 pe-2" style="letter-spacing: -0.01em;">"{{ state.data.tipText }}"</p>
        </div>
      </div>
    </div>
  `
})
export class EcoTipCardComponent {
  @Input() state: AiFeatureState<EcoTipResponse> = { loading: true, data: null, error: null };
  LightbulbIcon = Lightbulb;
  ZapIcon = Zap;
  CalendarIcon = Calendar;
}

