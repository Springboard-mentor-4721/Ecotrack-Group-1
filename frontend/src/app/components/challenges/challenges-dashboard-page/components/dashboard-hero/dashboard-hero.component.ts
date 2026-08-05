import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ch-bg-success text-white rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden shadow-sm">
      <div class="position-absolute top-0 end-0 opacity-10" style="width: 300px; height: 300px; background: radial-gradient(circle, white 0%, transparent 70%); transform: translate(30%, -30%); pointer-events: none;"></div>
      
      <div class="position-relative z-1">
        <h1 class="fw-bold fs-2 mb-2">Challenge Mission Control 🎯</h1>
        <p class="fs-6 opacity-75 mb-4" style="max-width: 600px;">
          Track your active challenges, stay within budgets, and continue making progress toward your sustainability goals.
        </p>
        
        <div class="d-flex flex-wrap gap-3">
          <div class="bg-white bg-opacity-10 rounded-3 px-4 py-2 border border-white border-opacity-25 shadow-sm">
            <span class="d-block fs-xs text-uppercase tracking-wide opacity-75 mb-1">Active Challenges</span>
            <span class="fs-3 fw-bold lh-1">{{ activeChallengesCount }}</span>
          </div>
          <div class="bg-white bg-opacity-10 rounded-3 px-4 py-2 border border-white border-opacity-25 shadow-sm">
            <span class="d-block fs-xs text-uppercase tracking-wide opacity-75 mb-1">Current Streak</span>
            <span class="fs-3 fw-bold lh-1">{{ currentStreak }} <span class="fs-sm fw-normal opacity-75">days</span></span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardHeroComponent {
  @Input() activeChallengesCount: number = 0;
  @Input() currentStreak: number = 0; // Placeholder
}
