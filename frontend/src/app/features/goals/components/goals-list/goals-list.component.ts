import { Component, computed, inject, signal, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService } from '../../services/goal.service';
import { Goal, GoalCategory, GoalStatus } from '../../interfaces/goal.interface';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-goals-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="card premium-card p-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 class="mb-0 fw-bold">Your Goals</h4>
        
        <div class="d-flex gap-3 flex-wrap">
          <!-- Tabs -->
          <div class="nav nav-pills custom-tabs" role="tablist">
            <button class="nav-link" [class.active]="activeTab() === 'All'" (click)="setTab('All')" role="tab" [attr.aria-selected]="activeTab() === 'All'">All</button>
            <button class="nav-link" [class.active]="activeTab() === 'In Progress'" (click)="setTab('In Progress')" role="tab" [attr.aria-selected]="activeTab() === 'In Progress'">In Progress</button>
            <button class="nav-link" [class.active]="activeTab() === 'Completed'" (click)="setTab('Completed')" role="tab" [attr.aria-selected]="activeTab() === 'Completed'">Completed</button>
            <button class="nav-link" [class.active]="activeTab() === 'Pending'" (click)="setTab('Pending')" role="tab" [attr.aria-selected]="activeTab() === 'Pending'">Pending</button>
          </div>
          
          <!-- Sort Dropdown -->
          <select class="form-select w-auto premium-input-sm" (change)="onSortChange($event)" aria-label="Sort goals by">
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Progress</option>
            <option value="lowest">Lowest Progress</option>
          </select>
        </div>
      </div>

      <!-- Goals List -->
      <div class="row g-4">
        <div class="col-md-6 col-lg-4" *ngFor="let goal of filteredGoals(); trackBy: trackByGoal">
          <div class="card goal-card h-100" (click)="onGoalClick(goal)" role="button" tabindex="0" (keydown.enter)="onGoalClick(goal)" [attr.aria-label]="'View details for ' + goal.title">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="category-icon" [ngClass]="getCategoryClass(goal.category)" aria-hidden="true">
                  <lucide-icon [name]="getCategoryIcon(goal.category)" [size]="20"></lucide-icon>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-pill" [ngClass]="getStatusBadgeClass(goal.status)">{{ goal.status }}</span>
                  <button class="btn btn-sm btn-icon text-muted" (click)="openMenu($event, goal)" aria-label="Goal options">
                    <lucide-icon name="ellipsis-vertical" [size]="16"></lucide-icon>
                  </button>
                </div>
              </div>
              
              <h5 class="card-title fw-bold text-truncate" [title]="goal.title">{{ goal.title }}</h5>
              <p class="card-text text-muted small text-truncate-2 mb-4">{{ goal.description }}</p>
              
              <div class="mt-auto">
                <div class="d-flex justify-content-between text-sm mb-2">
                  <span class="fw-semibold">{{ goal.progressPercentage }}%</span>
                  <span class="text-muted">{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.measurementUnit }}</span>
                </div>
                <div class="progress rounded-pill" style="height: 6px;" role="progressbar" [attr.aria-valuenow]="goal.progressPercentage" aria-valuemin="0" aria-valuemax="100">
                  <div class="progress-bar rounded-pill" [ngClass]="getProgressBarClass(goal.status)" 
                       [style.width.%]="goal.progressPercentage"></div>
                </div>
                
                <div class="d-flex justify-content-between text-muted small mt-3">
                  <span>Target: {{ goal.targetDate | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredGoals().length === 0" class="col-12 text-center py-5">
          <div class="empty-state">
            <div class="mb-3 d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style="width: 80px; height: 80px;">
              <lucide-icon name="target" [size]="40" class="text-muted opacity-50"></lucide-icon>
            </div>
            <h5 class="text-muted fw-bold">No Goals Found</h5>
            <p class="text-muted small">You don't have any goals matching the selected criteria.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-tabs .nav-link {
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      padding: 0.5rem 1rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      cursor: pointer;
      border: none;
      background: transparent;
    }
    .custom-tabs .nav-link.active {
      background-color: var(--color-primary);
      color: white;
    }
    .custom-tabs .nav-link:hover:not(.active) {
      background-color: rgba(34, 197, 94, 0.1);
      color: var(--color-primary);
    }
    
    .premium-input-sm {
      height: 40px;
      padding: 0 1rem;
      font-size: 0.875rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }
    
    .goal-card {
      border: 1px solid var(--color-border);
      border-radius: 16px;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
      cursor: pointer;
    }
    .goal-card:hover, .goal-card:focus {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border-color: rgba(76, 175, 80, 0.3);
      outline: none;
    }
    
    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .icon-green { background-color: #d1fae5; color: #10b981; }
    .icon-blue { background-color: #dbeafe; color: #3b82f6; }
    .icon-purple { background-color: #ede9fe; color: #8b5cf6; }
    .icon-amber { background-color: #fef3c7; color: #f59e0b; }
    .icon-cyan { background-color: #cffafe; color: #06b6d4; }
    .icon-rose { background-color: #ffe4e6; color: #f43f5e; }
    
    .badge-in-progress { background-color: #dbeafe; color: #1d4ed8; }
    .badge-completed { background-color: #d1fae5; color: #047857; }
    .badge-pending { background-color: #fef3c7; color: #b45309; }
    
    .bg-progress { background-color: #3b82f6; }
    .bg-completed { background-color: #10b981; }
    .bg-pending { background-color: #f59e0b; }
    
    .text-sm { font-size: 0.875rem; }
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .btn-icon {
      padding: 0;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
    }
    .btn-icon:hover {
      background-color: var(--color-border);
      border-radius: 50%;
    }
  `]
})
export class GoalsListComponent {
  goalService = inject(GoalService);
  
  @Output() goalSelected = new EventEmitter<Goal>();

  activeTab = signal<string>('All');
  sortBy = signal<string>('recent');

  filteredGoals = computed(() => {
    let goals = this.goalService.goalsSignal();
    
    // Filter
    if (this.activeTab() !== 'All') {
      goals = goals.filter(g => g.status === this.activeTab());
    }
    
    // Sort
    goals = [...goals].sort((a, b) => {
      switch(this.sortBy()) {
        case 'recent': return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'oldest': return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        case 'highest': return b.progressPercentage - a.progressPercentage;
        case 'lowest': return a.progressPercentage - b.progressPercentage;
        default: return 0;
      }
    });
    
    return goals;
  });

  trackByGoal(index: number, goal: Goal): string {
    return goal.id;
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sortBy.set(value);
  }

  onGoalClick(goal: Goal) {
    this.goalSelected.emit(goal);
  }
  
  openMenu(event: Event, goal: Goal) {
    event.stopPropagation();
    // In a real app, open a material menu here
  }

  getCategoryIcon(category: GoalCategory): string {
    switch(category) {
      case 'Reduce Carbon': return 'footprints';
      case 'Transportation': return 'car';
      case 'Plant Trees': return 'leaf';
      case 'Electricity': return 'zap';
      case 'Waste': return 'recycle';
      case 'Water': return 'droplets';
      case 'Food': return 'utensils-crossed';
      case 'Shopping': return 'shopping-cart';
      case 'Travel': return 'plane';
      default: return 'target';
    }
  }

  getCategoryClass(category: GoalCategory): string {
    switch(category) {
      case 'Reduce Carbon': return 'icon-amber';
      case 'Transportation': return 'icon-blue';
      case 'Plant Trees': return 'icon-green';
      case 'Electricity': return 'icon-amber';
      case 'Waste': return 'icon-rose';
      case 'Water': return 'icon-cyan';
      case 'Food': return 'icon-amber';
      case 'Shopping': return 'icon-purple';
      case 'Travel': return 'icon-blue';
      default: return 'icon-green';
    }
  }

  getStatusBadgeClass(status: GoalStatus): string {
    switch(status) {
      case 'In Progress': return 'badge-in-progress';
      case 'Completed': return 'badge-completed';
      case 'Pending': return 'badge-pending';
      default: return '';
    }
  }

  getProgressBarClass(status: GoalStatus): string {
    switch(status) {
      case 'In Progress': return 'bg-progress';
      case 'Completed': return 'bg-completed';
      case 'Pending': return 'bg-pending';
      default: return 'bg-progress';
    }
  }
}
