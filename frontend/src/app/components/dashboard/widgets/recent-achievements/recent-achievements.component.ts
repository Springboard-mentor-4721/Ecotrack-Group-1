import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../../../../models/gamification.models';

@Component({
  selector: 'app-recent-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm rounded-4 h-100">
      <div class="card-header bg-transparent border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-0">Recent Achievements</h6>
      </div>
      <div class="card-body p-4">
        <div *ngIf="!badges || badges.length === 0" class="text-center text-muted py-3">
          <p class="mb-0 fs-7">No achievements yet. Keep going!</p>
        </div>
        <div class="d-flex gap-3 overflow-x-auto pb-2" *ngIf="badges && badges.length > 0">
          <div *ngFor="let badge of badges" class="text-center flex-shrink-0" style="width: 80px;">
            <div class="badge-icon rounded-circle mb-2 mx-auto d-flex align-items-center justify-content-center shadow-sm"
                 [ngClass]="getBadgeClass(badge.rarity)" style="width: 50px; height: 50px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <span class="fs-xs fw-bold text-truncate d-block">{{ badge.name }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecentAchievementsComponent {
  @Input() badges: Badge[] = [];

  getBadgeClass(rarity: string): string {
    switch (rarity) {
      case 'BRONZE': return 'bg-orange-light text-orange';
      case 'SILVER': return 'bg-slate-200 text-slate-700';
      case 'GOLD': return 'bg-yellow-light text-yellow-600';
      case 'PLATINUM': return 'bg-cyan-light text-cyan-600';
      default: return 'bg-light text-secondary';
    }
  }
}
