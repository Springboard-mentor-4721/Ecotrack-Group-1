import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xp-level-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium h-full p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2">
          <div class="bg-green-100 text-green-700 rounded-full px-4 py-2 font-bold text-sm">
            Level {{ level }}
          </div>
        </div>
        <span class="text-gray-500 font-bold text-sm">{{ xp }} XP</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div class="bg-primary h-3 rounded-full" 
             [style.width.%]="getProgress()"></div>
      </div>
      <div class="text-right mt-3">
        <span class="text-gray-400 text-xs font-bold">{{ nextLevelXp - xp }} XP to Level {{ level + 1 }}</span>
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
