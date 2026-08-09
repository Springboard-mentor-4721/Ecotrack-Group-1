import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-skeleton-line',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse flex space-x-4 mb-3">
      <div class="flex-1 space-y-4 py-1">
        <div class="h-4 bg-green-200 rounded w-3/4"></div>
        <div class="space-y-2" *ngIf="lines > 1">
          <div class="h-4 bg-green-100 rounded"></div>
          <div class="h-4 bg-green-100 rounded w-5/6" *ngIf="lines > 2"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AiSkeletonLineComponent {
  @Input() lines: number = 3;
}
