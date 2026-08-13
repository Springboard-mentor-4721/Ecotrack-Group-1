import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-dark rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-sm" style="background: var(--hero-gradient); border: 1px solid var(--border-color);">
      
      <div class="position-relative z-1 row align-items-center">
        <div class="col-lg-6">
          <h1 class="fw-bold fs-2 mb-2 text-primary">Challenge <span style="color: var(--color-leaf);">Mission Control</span></h1>
          <p class="fs-6 mb-4 text-muted" style="max-width: 600px;">
            Track your active challenges, stay within budgets, and continue making progress toward your sustainability goals.
          </p>
        </div>
        
        <div class="col-lg-6 mt-4 mt-lg-0 text-end d-flex flex-column align-items-end justify-content-center">
          <div class="d-flex flex-column gap-0 rounded-4 text-start card-premium" style="padding: 1.5rem; min-width: 320px;">
            
            <div class="d-flex align-items-center gap-3 pb-3" style="border-bottom: 1px solid var(--border-color);">
              <div class="rounded-circle d-flex align-items-center justify-content-center bg-emerald-light text-emerald" style="width: 40px; height: 40px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
              </div>
              <div>
                <div class="fs-xs fw-bold text-uppercase tracking-wide mb-1 text-muted">Active Challenges</div>
                <div class="fs-3 fw-bold lh-1 text-primary">{{ activeChallengesCount }}</div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 pt-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center bg-blue bg-opacity-10 text-blue" style="width: 40px; height: 40px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <div class="fs-xs fw-bold text-uppercase tracking-wide mb-1 text-muted">Completed Challenges</div>
                <div class="fs-3 fw-bold lh-1 text-primary">{{ completedCount }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardHeroComponent {
  @Input() activeChallengesCount: number = 0;
  @Input() completedCount: number = 0;
}
