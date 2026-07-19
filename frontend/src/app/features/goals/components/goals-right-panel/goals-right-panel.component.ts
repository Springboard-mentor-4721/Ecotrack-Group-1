import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService } from '../../services/goal.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-goals-right-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  template: `
    <div class="right-panel d-flex flex-column gap-4">
      
      <!-- Overall Progress -->
      <div class="card premium-card p-4">
        <h6 class="fw-bold mb-4">Overall Progress</h6>
        <div class="d-flex justify-content-center align-items-center position-relative mb-3">
          <canvas baseChart
            [data]="doughnutChartData()"
            [options]="doughnutChartOptions"
            [type]="'doughnut'"
            height="150"
            width="150"
            style="max-width: 150px; max-height: 150px;">
          </canvas>
          <div class="position-absolute d-flex flex-column align-items-center justify-content-center" style="top:0; left:0; right:0; bottom:0;">
            <h3 class="mb-0 fw-bold">{{ averageCompletion() }}%</h3>
          </div>
        </div>
        <p class="text-center text-muted small mb-0">Average Completion Rate</p>
      </div>

      <!-- Goal Analytics -->
      <div class="card premium-card p-4">
        <h6 class="fw-bold mb-4">Goal Analytics</h6>
        <canvas baseChart
          [data]="barChartData"
          [options]="barChartOptions"
          [type]="'bar'"
          height="120">
        </canvas>
      </div>

      <!-- Achievements Card -->
      <div class="card premium-card p-4 bg-primary text-white border-0 shadow-lg" style="background: var(--grad-eco-main) !important;">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h6 class="fw-bold mb-0 text-white">Achievements</h6>
          <lucide-icon name="trophy" [size]="20" class="text-white opacity-75"></lucide-icon>
        </div>
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="badge bg-white text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <lucide-icon name="flame" [size]="24"></lucide-icon>
          </div>
          <div>
            <h5 class="mb-0 fw-bold text-white">14 Days</h5>
            <p class="mb-0 opacity-75 small">Current Streak</p>
          </div>
        </div>
        <div>
          <p class="mb-2 font-xs opacity-75">Unlocked Badges</p>
          <div class="d-flex gap-2">
            <span class="badge bg-white bg-opacity-25 border border-white border-opacity-50">Early Bird</span>
            <span class="badge bg-white bg-opacity-25 border border-white border-opacity-50">Recycler</span>
            <span class="badge bg-white bg-opacity-25 border border-white border-opacity-50">+3 more</span>
          </div>
        </div>
      </div>

      <!-- Eco Tips Card -->
      <div class="card premium-card p-4 border border-success border-opacity-25 bg-success-subtle">
        <div class="d-flex gap-3 align-items-start">
          <div class="text-success mt-1">
            <lucide-icon name="lightbulb" [size]="24"></lucide-icon>
          </div>
          <div>
            <h6 class="fw-bold text-success mb-2">Eco Tip of the Day</h6>
            <p class="mb-0 small text-success-emphasis">"Small changes add up. Turning off the tap while brushing saves up to 8 gallons of water!"</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .right-panel {
      position: sticky;
      top: 2rem;
    }
    .bg-success-subtle { background-color: #f0fdf4 !important; }
    .text-success-emphasis { color: #166534 !important; }
    .font-xs { font-size: 0.75rem; }
  `]
})
export class GoalsRightPanelComponent {
  goalService = inject(GoalService);

  // Compute average completion
  averageCompletion = computed(() => {
    const goals = this.goalService.goalsSignal();
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, goal) => acc + goal.progressPercentage, 0);
    return Math.round(sum / goals.length);
  });

  // Doughnut Chart
  doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };
  
  doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const avg = this.averageCompletion();
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [avg, 100 - avg],
          backgroundColor: ['#22c55e', '#e2e8f0'],
          borderWidth: 0,
          hoverBackgroundColor: ['#16a34a', '#cbd5e1']
        }
      ]
    };
  });

  // Bar Chart (Mocked)
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { display: false, grid: { display: false } }
    }
  };
  barChartData: ChartData<'bar'> = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        data: [12, 19, 15, 25, 22, 30, 28],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  };
}
