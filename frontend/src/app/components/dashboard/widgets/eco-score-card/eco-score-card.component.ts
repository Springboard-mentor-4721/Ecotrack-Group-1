import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eco-score-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm rounded-4 h-100">
      <div class="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
        <h6 class="text-muted fw-bold mb-3">EcoScore</h6>
        <div class="eco-score-gauge position-relative d-flex align-items-center justify-content-center rounded-circle"
             [style.background]="getConicGradient()">
          <div class="inner-circle bg-white rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm">
            <span class="fs-1 fw-bold text-dark lh-1">{{ score }}</span>
            <span class="fs-7 text-muted fw-bold">{{ grade }}</span>
          </div>
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
