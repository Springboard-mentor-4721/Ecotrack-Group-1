import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { EcoTipResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { LucideAngularModule, Lightbulb, Zap } from 'lucide-angular';

@Component({
  selector: 'app-eco-tip-card',
  standalone: true,
  imports: [CommonModule, AiSkeletonLineComponent, AiEmptyHintComponent, LucideAngularModule],
  template: `
    <div class="card-premium p-4 h-100 bg-surface border-0 d-flex flex-column">
       <div class="d-flex align-items-center mb-4">
          <div class="icon-circle bg-emerald-light text-emerald me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
             <lucide-angular [img]="LightbulbIcon" size="20"></lucide-angular>
          </div>
          <h5 class="fw-bold text-dark mb-0 fs-5">Daily Eco Tip</h5>
       </div>

       <div *ngIf="state.loading" class="position-relative z-1 flex-grow-1">
          <app-ai-skeleton-line [lines]="2"></app-ai-skeleton-line>
       </div>
       
       <div *ngIf="state.error" class="position-relative z-1 flex-grow-1 text-center py-2">
          <app-ai-empty-hint title="AI Tip Unavailable" [message]="state.error"></app-ai-empty-hint>
       </div>
       
       <div *ngIf="state.data" class="position-relative z-1 flex-grow-1 d-flex flex-column">
          <p class="fs-6 text-dark mt-2 mb-3 lh-sm fst-italic">"{{ state.data.tipText }}"</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
             <span class="badge bg-light border text-dark fs-xs px-2 py-1 rounded-pill shadow-sm" *ngIf="state.data.relatedCategory">
               Focus: {{ state.data.relatedCategory }}
             </span>
             <span class="text-emerald fs-xs fw-bold d-flex align-items-center">
               <lucide-angular [img]="ZapIcon" size="14" class="me-1"></lucide-angular>
               AI Generated
             </span>
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
