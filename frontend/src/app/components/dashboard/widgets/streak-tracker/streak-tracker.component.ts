import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streak-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm rounded-4 h-100 bg-orange-light border-orange">
      <div class="card-body p-4 d-flex align-items-center justify-content-between">
        <div>
          <h6 class="text-orange fw-bold mb-1">Current Streak</h6>
          <span class="fs-1 fw-bold text-dark lh-1">{{ streak }} <span class="fs-5 text-muted">Days</span></span>
        </div>
        <div class="streak-icon bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class StreakTrackerComponent {
  @Input() streak: number = 0;
}
