import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiFeatureState } from '../../../../models/ai-feature-state.model';
import { BehavioralInsightsResponse } from '../../../../models/ai-models';
import { AiSkeletonLineComponent } from '../../../../shared/components/ai-skeleton-line/ai-skeleton-line.component';
import { AiEmptyHintComponent } from '../../../../shared/components/ai-empty-hint/ai-empty-hint.component';
import { AiFallbackNoteComponent } from '../../../../shared/components/ai-fallback-note/ai-fallback-note.component';

@Component({
  selector: 'app-behavioral-insights-panel',
  standalone: true,
  imports: [CommonModule, AiSkeletonLineComponent, AiEmptyHintComponent, AiFallbackNoteComponent],
  template: `
    <div class="card-premium p-4 position-relative overflow-hidden border border-slate shadow-sm h-100">
       <div class="d-flex align-items-center mb-4">
          <div class="icon-circle bg-purple-soft text-purple me-3" style="width: 40px; height: 40px;">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
             </svg>
          </div>
          <h5 class="fw-bold text-dark mb-0">AI Behavioral Insights</h5>
       </div>

       <div *ngIf="state.loading" class="mt-3">
          <app-ai-skeleton-line [lines]="3"></app-ai-skeleton-line>
          <div class="mt-3"><app-ai-skeleton-line [lines]="2"></app-ai-skeleton-line></div>
       </div>
       
       <div *ngIf="state.error" class="mt-3">
          <app-ai-empty-hint title="Insights Unavailable" [message]="state.error"></app-ai-empty-hint>
       </div>
       
       <div *ngIf="state.data" class="mt-2">
          <div *ngIf="state.data.insights.length === 0">
             <app-ai-empty-hint title="No Distinct Patterns Found" message="Keep logging your activities. As your journal grows, AI will detect repeating behaviors and suggest improvements."></app-ai-empty-hint>
          </div>
          
          <div *ngIf="state.data.insights.length > 0" class="d-flex flex-column gap-3">
             <div *ngFor="let insight of state.data.insights" class="insight-item border-bottom pb-3 last-pb-0 last-border-0">
                <div class="d-flex justify-content-between align-items-start mb-2">
                   <h6 class="fw-bold text-dark mb-0 pe-2">{{ insight.patternText }}</h6>
                   <span class="badge rounded-pill fs-xs px-2 py-1 mt-1 flex-shrink-0"
                         [ngClass]="{
                            'bg-danger-soft text-danger': insight.impactWeight === 'HIGH',
                            'bg-warning-soft text-warning': insight.impactWeight === 'MEDIUM',
                            'bg-secondary-soft text-secondary': insight.impactWeight === 'LOW'
                         }">
                      {{ insight.impactWeight }} Impact
                   </span>
                </div>
                
                <p class="fs-7 text-muted mb-2">
                   <span class="badge bg-surface border text-muted fs-xs rounded-pill me-2">{{ insight.category }}</span>
                </p>
                
                <div class="bg-surface rounded-3 p-3 border">
                   <div class="d-flex align-items-start">
                     <svg width="16" height="16" class="text-purple me-2 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                     </svg>
                     <span class="fs-7 text-dark lh-sm fw-medium">{{ insight.recommendation }}</span>
                   </div>
                </div>
             </div>
          </div>
          
          <div class="mt-4 pt-2 border-top">
             <app-ai-fallback-note></app-ai-fallback-note>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .last-pb-0:last-child { padding-bottom: 0 !important; }
    .last-border-0:last-child { border-bottom: none !important; }
  `]
})
export class BehavioralInsightsPanelComponent {
  @Input() state: AiFeatureState<BehavioralInsightsResponse> = { loading: true, data: null, error: null };
}
