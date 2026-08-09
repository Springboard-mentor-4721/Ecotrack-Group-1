import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { EcoTipResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { AiFallbackNoteComponent } from '../../../../shared/components/ai-fallback-note/ai-fallback-note.component';

@Component({
  selector: 'app-eco-tip-card',
  standalone: true,
  imports: [CommonModule, AiSkeletonLineComponent, AiEmptyHintComponent, AiFallbackNoteComponent],
  template: `
    <div class="card-premium p-4 position-relative overflow-hidden h-100 bg-teal-soft border-0">
       <div class="position-absolute top-0 end-0 p-3 opacity-25">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
       </div>
       
       <div class="d-flex align-items-center mb-3 position-relative z-1">
          <div class="icon-circle bg-white text-teal shadow-sm me-3" style="width: 40px; height: 40px;">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
             </svg>
          </div>
          <h5 class="fw-bold text-dark mb-0">Daily Eco Tip</h5>
       </div>

       <div *ngIf="state.loading" class="position-relative z-1 mt-3">
          <app-ai-skeleton-line [lines]="2"></app-ai-skeleton-line>
       </div>
       
       <div *ngIf="state.error" class="position-relative z-1 mt-3">
          <app-ai-empty-hint title="AI Tip Unavailable" [message]="state.error"></app-ai-empty-hint>
       </div>
       
       <div *ngIf="state.data" class="position-relative z-1 mt-3">
          <p class="fs-5 fw-bold text-dark mb-3 lh-sm">"{{ state.data.tipText }}"</p>
          <span class="badge bg-white text-teal fs-xs px-2 py-1 rounded-pill shadow-sm" *ngIf="state.data.relatedCategory">
            Focus: {{ state.data.relatedCategory }}
          </span>
          <app-ai-fallback-note></app-ai-fallback-note>
       </div>
    </div>
  `
})
export class EcoTipCardComponent {
  @Input() state: AiFeatureState<EcoTipResponse> = { loading: true, data: null, error: null };
}
