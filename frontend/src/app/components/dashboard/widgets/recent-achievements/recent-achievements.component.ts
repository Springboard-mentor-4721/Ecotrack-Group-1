import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../../../../models/gamification.models';
import { BadgeEmblemComponent } from '../../../../shared/components/badge-emblem/badge-emblem.component';

@Component({
  selector: 'app-recent-achievements',
  standalone: true,
  imports: [CommonModule, BadgeEmblemComponent],
  template: `
    <div class="card-premium h-full p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h6 class="font-bold text-gray-900 text-lg mb-0">Recent Achievements</h6>
      </div>
      <div class="my-auto flex flex-col justify-center">
        <div *ngIf="!badges || badges.length === 0" class="text-center text-gray-500 py-4">
          <p class="mb-0 text-sm">Your first achievement is waiting.</p>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2" *ngIf="badges && badges.length > 0">
          <div *ngFor="let badge of badges" class="text-center flex-shrink-0" style="width: 80px;">
            <div class="mb-2 mx-auto flex items-center justify-center">
              <app-badge-emblem [badge]="badge" [size]="64"></app-badge-emblem>
            </div>
            <span class="text-xs font-bold text-wrap block text-gray-900" style="line-height: 1.2; word-break: break-word;">{{ badge.name }}</span>
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
      case 'COMMON': return 'bg-orange-light text-orange';
      case 'RARE': return 'bg-slate-200 text-slate-700';
      case 'EPIC': return 'bg-yellow-light text-yellow-600';
      case 'LEGENDARY': return 'bg-cyan-light text-cyan-600';
      default: return 'bg-light text-secondary';
    }
  }
}
