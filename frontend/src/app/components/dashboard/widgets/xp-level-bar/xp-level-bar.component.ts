import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xp-level-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm rounded-4 h-100">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-2">
            <div class="badge bg-emerald-light text-emerald rounded-pill px-3 py-2 fw-bold fs-6">
              Level {{ level }}
            </div>
          </div>
          <span class="text-muted fw-bold fs-7">{{ xp }} XP</span>
        </div>
        <div class="progress" style="height: 12px; border-radius: 10px;">
          <div class="progress-bar bg-emerald" role="progressbar" 
               [style.width.%]="getProgress()" 
               [attr.aria-valuenow]="getProgress()" 
               aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="text-end mt-2">
          <span class="text-muted fs-xs fw-bold">{{ nextLevelXp - xp }} XP to Level {{ level + 1 }}</span>
        </div>
      </div>
    </div>
  `
})
export class XpLevelBarComponent {
  @Input() level: number = 1;
  @Input() xp: number = 0;
  @Input() currentLevelBaseXp: number = 0;
  @Input() nextLevelXp: number = 1000;

  getProgress(): number {
    if (this.nextLevelXp === null || this.nextLevelXp === undefined) return 100;
    
    const range = this.nextLevelXp - (this.currentLevelBaseXp || 0);
    if (range <= 0 || this.xp >= this.nextLevelXp) return 100;
    
    const progressWithinLevel = this.xp - (this.currentLevelBaseXp || 0);
    return Math.min(100, Math.max(0, (progressWithinLevel / range) * 100));
  }
}
