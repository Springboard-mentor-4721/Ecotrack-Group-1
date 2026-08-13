import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eco-score-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-premium h-full p-6 flex flex-col items-center justify-center text-center bg-white rounded-xl shadow-sm border border-gray-100">
      <h6 class="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">EcoScore</h6>
      <div class="eco-score-gauge relative flex items-center justify-center rounded-full"
           [style.background]="getConicGradient()">
        <div class="inner-circle bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
          <span class="text-4xl font-black text-gray-900 leading-none mb-1">{{ score }}</span>
          <span class="text-xs text-gray-500 font-bold">{{ grade }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .eco-score-gauge {
      width: 140px;
      height: 140px;
      padding: 12px;
    }
    .inner-circle {
      width: 100%;
      height: 100%;
    }
  `]
})
export class EcoScoreCardComponent {
  @Input() score: number = 0;
  @Input() grade: string = 'N/A';

  getConicGradient(): string {
    const percentage = Math.min(100, Math.max(0, this.score));
    return `conic-gradient(#10b981 ${percentage}%, #f1f5f9 0)`;
  }
}
