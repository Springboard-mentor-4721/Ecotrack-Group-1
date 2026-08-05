import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row g-3 mb-5 animate-stagger-item">
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/explore']" class="text-decoration-none d-block bg-white border rounded-4 p-4 text-center transition-all hover-shadow group h-100">
          <div class="ch-bg-info bg-opacity-10 ch-text-info mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <span class="d-block fw-bold text-dark fs-sm">Explore</span>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/my']" class="text-decoration-none d-block bg-white border rounded-4 p-4 text-center transition-all hover-shadow group h-100">
          <div class="ch-bg-success bg-opacity-10 ch-text-success mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <span class="d-block fw-bold text-dark fs-sm">My Challenges</span>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <a [routerLink]="['/challenges/history']" class="text-decoration-none d-block bg-white border rounded-4 p-4 text-center transition-all hover-shadow group h-100">
          <div class="ch-bg-neutral bg-opacity-10 ch-text-neutral mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 group-hover-scale transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
          </div>
          <span class="d-block fw-bold text-dark fs-sm">History</span>
        </a>
      </div>
      <div class="col-6 col-md-3">
        <div class="d-block bg-surface border rounded-4 p-4 text-center transition-all h-100 opacity-75" style="cursor: not-allowed;">
          <div class="ch-bg-neutral bg-opacity-10 ch-text-neutral mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 transition-all" style="width: 48px; height: 48px;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <span class="d-block fw-bold text-slate-500 fs-sm">Log Entry <br><span class="fs-xs fw-normal">(Coming Soon)</span></span>
        </div>
      </div>
    </div>
  `
})
export class DashboardQuickActionsComponent {}
