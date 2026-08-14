import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { EcoTipResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { LucideAngularModule, Lightbulb, Zap } from 'lucide-angular';

@Component({
  selector: 'app-eco-tip-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AiSkeletonLineComponent, AiEmptyHintComponent, LucideAngularModule],
  template: `
    <div class="card-premium h-100 bg-white border border-gray-100 rounded-4 shadow-sm d-flex flex-column overflow-hidden position-relative group">
      
      <!-- Decorative background accent -->
      <div class="position-absolute top-0 end-0 p-4 opacity-5">
        <lucide-angular [img]="LightbulbIcon" size="100" class="text-teal"></lucide-angular>
      </div>

      <div class="p-4 d-flex flex-column h-100 position-relative z-1">
        <div class="d-flex align-items-center mb-3">
          <h6 class="fw-bold text-muted text-uppercase tracking-wider fs-xs mb-0">Today's Eco Tip</h6>
        </div>

        <div *ngIf="state.loading" class="flex-grow-1">
          <app-ai-skeleton-line [lines]="3"></app-ai-skeleton-line>
        </div>
        
        <div *ngIf="state.error" class="flex-grow-1 text-center py-2">
          <app-ai-empty-hint title="AI Tip Unavailable" [message]="state.error"></app-ai-empty-hint>
        </div>
        
        <div *ngIf="state.data" class="flex-grow-1 d-flex flex-column">
          
          <div *ngIf="state.data.relatedCategory" class="d-flex align-items-center gap-2 mb-2">
            <span class="fs-6">💡</span>
            <span class="fw-bold text-teal text-uppercase fs-7">{{ state.data.relatedCategory }}</span>
          </div>

          <p class="fs-5 text-dark fw-medium lh-sm mb-3">"{{ state.data.tipText }}"</p>
          
          <div class="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
             <span class="text-teal fs-xs fw-bold d-flex align-items-center gap-1">
               <lucide-angular [img]="ZapIcon" size="14"></lucide-angular>
               AI Generated
             </span>
             <a routerLink="/carbon-tracker" class="btn btn-sm btn-light text-teal fw-bold rounded-pill px-3 transition-all hover-teal">
               Log Activity
             </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EcoTipCardComponent {
  @Input() state: AiFeatureState<EcoTipResponse> = { loading: true, data: null, error: null };
  LightbulbIcon = Lightbulb;
  ZapIcon = Zap;
}
