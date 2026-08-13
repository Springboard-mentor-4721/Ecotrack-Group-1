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
    <div class="card-premium p-5 h-full bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
       <div class="flex items-center mb-4">
          <div class="rounded-full bg-green-100 text-green-600 mr-3 flex items-center justify-center flex-shrink-0" style="width: 36px; height: 36px;">
             <lucide-angular [img]="LightbulbIcon" size="18"></lucide-angular>
          </div>
          <h5 class="font-bold text-gray-900 mb-0 text-lg">Daily Eco Tip</h5>
       </div>

       <div *ngIf="state.loading" class="relative z-10 flex-grow">
          <app-ai-skeleton-line [lines]="2"></app-ai-skeleton-line>
       </div>
       
       <div *ngIf="state.error" class="relative z-10 flex-grow text-center py-2">
          <app-ai-empty-hint title="AI Tip Unavailable" [message]="state.error"></app-ai-empty-hint>
       </div>
       
       <div *ngIf="state.data" class="relative z-10 flex-grow flex flex-col">
          <p class="text-base text-gray-900 mt-2 mb-4 leading-tight italic">"{{ state.data.tipText }}"</p>
          <div class="mt-auto flex justify-between items-center">
             <span class="bg-gray-50 border border-gray-200 text-gray-900 text-xs px-3 py-1 rounded-full shadow-sm" *ngIf="state.data.relatedCategory">
               Focus: {{ state.data.relatedCategory }}
             </span>
             <span class="text-green-600 text-xs font-bold flex items-center">
               <lucide-angular [img]="ZapIcon" size="14" class="mr-1"></lucide-angular>
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
