import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-empty-hint',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center p-4 border border-dashed rounded-4 bg-surface-hover">
      <div class="icon-circle bg-gray-100 text-muted mx-auto mb-3" style="width: 48px; height: 48px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
      </div>
      <h6 class="fw-bold text-dark">{{ title }}</h6>
      <p class="fs-7 text-muted mb-0">{{ message }}</p>
    </div>
  `
})
export class AiEmptyHintComponent {
  @Input() title: string = 'Not enough data yet';
  @Input() message: string = 'Log more activities to let AI generate personalized insights.';
}
