import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService } from '../../services/goal.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-goals-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="row g-4 mb-4">
      <!-- Total Goals -->
      <div class="col-md-3 col-sm-6">
        <div class="card premium-card hover-lift p-4 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted mb-1 font-sm">Total Goals</p>
              <h3 class="mb-0 text-success fw-bold">{{ totalGoals() }}</h3>
            </div>
            <div class="icon-box bg-success-subtle text-success">
              <lucide-icon name="target" [size]="24"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="col-md-3 col-sm-6">
        <div class="card premium-card hover-lift p-4 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted mb-1 font-sm">In Progress</p>
              <h3 class="mb-0 text-primary fw-bold">{{ goalsInProgress() }}</h3>
            </div>
            <div class="icon-box bg-primary-subtle text-primary">
              <lucide-icon name="trending-up" [size]="24"></lucide-icon>
            </div>
          </div>
          <div class="progress mt-3" style="height: 6px;">
            <div class="progress-bar bg-primary rounded-pill" role="progressbar" [style.width.%]="(goalsInProgress() / (totalGoals() || 1)) * 100"></div>
          </div>
        </div>
      </div>

      <!-- Achieved -->
      <div class="col-md-3 col-sm-6">
        <div class="card premium-card hover-lift p-4 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted mb-1 font-sm">Achieved</p>
              <h3 class="mb-0 text-purple fw-bold">{{ goalsCompleted() }}</h3>
            </div>
            <div class="icon-box bg-purple-subtle text-purple">
              <lucide-icon name="badge-check" [size]="24"></lucide-icon>
            </div>
          </div>
          <p class="text-muted mt-3 mb-0 font-xs">
            <span class="text-success">{{ ((goalsCompleted() / (totalGoals() || 1)) * 100).toFixed(0) }}%</span> completion rate
          </p>
        </div>
      </div>

      <!-- Pending -->
      <div class="col-md-3 col-sm-6">
        <div class="card premium-card hover-lift p-4 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted mb-1 font-sm">Pending</p>
              <h3 class="mb-0 text-amber fw-bold">{{ goalsPending() }}</h3>
            </div>
            <div class="icon-box bg-amber-subtle text-amber">
              <lucide-icon name="hourglass" [size]="24"></lucide-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .font-sm { font-size: 0.875rem; }
    .font-xs { font-size: 0.75rem; }
    
    .premium-card {
      border-radius: 16px;
      border: 1px solid var(--color-border, #e5e7eb);
    }
    
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-success-subtle { background-color: #d1fae5; }
    .bg-primary-subtle { background-color: #dbeafe; }
    .bg-purple-subtle { background-color: #ede9fe; }
    .bg-amber-subtle { background-color: #fef3c7; }
    
    .text-purple { color: #7c3aed; }
    .text-amber { color: #f59e0b; }
    
    .hover-lift {
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
    }
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border-color: rgba(76, 175, 80, 0.3);
    }
  `]
})
export class GoalsOverviewComponent {
  goalService = inject(GoalService);
  
  totalGoals = this.goalService.totalGoals;
  goalsInProgress = this.goalService.goalsInProgress;
  goalsCompleted = this.goalService.goalsCompleted;
  goalsPending = this.goalService.goalsPending;
}
