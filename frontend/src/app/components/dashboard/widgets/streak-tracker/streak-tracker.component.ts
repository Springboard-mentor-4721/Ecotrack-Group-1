import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streak-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium h-full p-6 bg-orange-50 rounded-xl shadow-sm border border-orange-200 flex items-center justify-between">
      <div>
        <h6 class="text-orange-600 font-bold mb-1 uppercase text-xs tracking-wider">Current Streak</h6>
        <span class="text-4xl font-black text-gray-900 leading-none">{{ streak }} <span class="text-xl text-gray-500 font-normal">Days</span></span>
      </div>
      <div class="bg-white rounded-full shadow-sm flex items-center justify-center flex-shrink-0" style="width: 60px; height: 60px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      </div>
    </div>
  `
})
export class StreakTrackerComponent {
  @Input() streak: number = 0;
}
