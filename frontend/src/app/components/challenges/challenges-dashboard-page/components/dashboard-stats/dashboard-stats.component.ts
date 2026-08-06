import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row g-4 mb-4">
      <div class="col-12 col-md-4">
        <div class="card-premium d-flex align-items-center gap-4 h-100 group">
          <div class="ch-bg-success bg-opacity-10 ch-text-success p-3 rounded-circle d-flex align-items-center justify-content-center transition-transform group-hover:scale-110" style="width: 56px; height: 56px;">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <span class="d-block fs-xs fw-bold text-muted text-uppercase tracking-wide mb-1">Active</span>
            <span class="d-block fs-2 fw-bolder text-primary lh-1">{{ activeCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="col-12 col-md-4">
        <div class="card-premium d-flex align-items-center gap-4 h-100 group">
          <div class="ch-bg-info bg-opacity-10 ch-text-info p-3 rounded-circle d-flex align-items-center justify-content-center transition-transform group-hover:scale-110" style="width: 56px; height: 56px;">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <span class="d-block fs-xs fw-bold text-muted text-uppercase tracking-wide mb-1">Completed</span>
            <span class="d-block fs-2 fw-bolder text-primary lh-1">{{ completedCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="col-12 col-md-4">
        <div class="card-premium d-flex align-items-center gap-4 h-100 group">
          <div class="ch-bg-xp bg-opacity-10 ch-text-xp p-3 rounded-circle d-flex align-items-center justify-content-center transition-transform group-hover:scale-110" style="width: 56px; height: 56px;">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div>
            <span class="d-block fs-xs fw-bold text-muted text-uppercase tracking-wide mb-1">Total XP</span>
            <span class="d-block fs-2 fw-bolder text-primary lh-1">{{ totalXp }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardStatsComponent {
  @Input() activeCount: number = 0;
  @Input() completedCount: number = 0;
  @Input() totalXp: number = 0;
}
