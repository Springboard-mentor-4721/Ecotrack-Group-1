import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row g-3 mb-5 animate-stagger-item">
      <div class="col-6 col-md-3">
        <div class="card-premium d-flex flex-column align-items-center justify-content-center h-100 group">
          <div class="ch-bg-xp bg-opacity-10 ch-text-xp mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <span class="d-block fs-xs fw-bold text-muted text-uppercase tracking-wide mb-1">Total XP</span>
          <span class="d-block fs-4 fw-bolder text-primary lh-1">{{ totalXp }}</span>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/explore']" class="text-decoration-none d-block card-premium text-center h-100 group">
          <div class="ch-bg-info bg-opacity-10 ch-text-info mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <span class="d-block fw-bold text-primary fs-sm">Explore</span>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/my']" class="text-decoration-none d-block card-premium text-center h-100 group">
          <div class="ch-bg-success bg-opacity-10 ch-text-success mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <span class="d-block fw-bold text-primary fs-sm">My Challenges</span>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/history']" class="text-decoration-none d-block card-premium text-center h-100 group">
          <div class="ch-bg-neutral bg-opacity-10 ch-text-neutral mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
          </div>
          <span class="d-block fw-bold text-primary fs-sm">History</span>
        </a>
      </div>
    </div>
  `
})
export class DashboardQuickActionsComponent {
  @Input() totalXp: number = 0;
}
