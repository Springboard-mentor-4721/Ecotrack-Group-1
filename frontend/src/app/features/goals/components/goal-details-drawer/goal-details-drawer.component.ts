import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Goal, GoalProgressEntry } from '../../interfaces/goal.interface';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-goal-details-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="drawer-overlay" [class.open]="isOpen" (click)="close.emit()" aria-hidden="true">
      <div class="drawer-content" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div class="drawer-header p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 id="drawer-title" class="mb-0 fw-bold">Goal Details</h5>
          <button class="btn btn-icon text-muted" (click)="close.emit()" aria-label="Close goal details">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <div class="drawer-body p-4" *ngIf="goal">
          
          <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
              <span class="badge bg-primary-subtle text-primary mb-2">{{ goal.category }}</span>
              <h4 class="fw-bold mb-1">{{ goal.title }}</h4>
              <p class="text-muted small">{{ goal.description }}</p>
            </div>
          </div>
          
          <div class="row g-3 mb-4">
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <p class="text-muted small mb-1">Priority</p>
                <p class="fw-semibold mb-0" [ngClass]="getPriorityClass(goal.priority)">{{ goal.priority }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <p class="text-muted small mb-1">Status</p>
                <p class="fw-semibold mb-0">{{ goal.status }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <p class="text-muted small mb-1">Target Date</p>
                <p class="fw-semibold mb-0">{{ goal.targetDate | date:'mediumDate' }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <p class="text-muted small mb-1">Created</p>
                <p class="fw-semibold mb-0">{{ goal.createdDate | date:'mediumDate' }}</p>
              </div>
            </div>
          </div>

          <h6 class="fw-bold mb-3">Progress Overview</h6>
          <div class="card bg-light border-0 p-3 mb-4">
            <div class="d-flex justify-content-between text-sm mb-2">
              <span class="fw-semibold">{{ goal.progressPercentage }}%</span>
              <span class="text-muted">{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.measurementUnit }}</span>
            </div>
            <div class="progress rounded-pill" style="height: 6px;" role="progressbar" [attr.aria-valuenow]="goal.progressPercentage" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar bg-success rounded-pill" [style.width.%]="goal.progressPercentage"></div>
            </div>
            <button class="btn btn-primary w-100 mt-3 d-flex justify-content-center align-items-center gap-2" (click)="recordProgress.emit(goal)" aria-label="Record Progress">
              <lucide-icon name="circle-dashed" [size]="18"></lucide-icon>
              Record Progress
            </button>
          </div>

          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <lucide-icon name="history" [size]="18" class="text-muted"></lucide-icon>
            Timeline
          </h6>
          <div class="timeline" role="list">
            <div class="timeline-item" role="listitem" *ngFor="let item of goal.progressHistory.slice().reverse(); trackBy: trackByHistory">
              <div class="timeline-marker bg-success"></div>
              <div class="timeline-content">
                <p class="mb-0 fw-semibold">Value: {{ item.value }}</p>
                <p class="text-muted small mb-1">{{ item.note }}</p>
                <span class="text-muted font-xs">{{ item.date | date:'mediumDate' }}</span>
              </div>
            </div>
            <div *ngIf="goal.progressHistory.length === 0" class="text-muted small">No progress recorded yet.</div>
          </div>
          
        </div>
        
        <div class="drawer-footer p-4 border-top d-flex gap-2 bg-white" *ngIf="goal">
          <button class="btn btn-outline-primary flex-grow-1 d-flex justify-content-center align-items-center gap-2" (click)="editGoal.emit(goal!)" aria-label="Edit Goal">
            <lucide-icon name="pencil" [size]="16"></lucide-icon>
            Edit Goal
          </button>
          <button class="btn btn-outline-danger flex-grow-1 d-flex justify-content-center align-items-center gap-2" (click)="deleteGoal.emit(goal!)" aria-label="Delete Goal">
            <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.4);
      z-index: 1050;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast);
    }
    .drawer-overlay.open {
      opacity: 1;
      visibility: visible;
    }
    .drawer-content {
      position: absolute;
      top: 0;
      right: -400px;
      width: 400px;
      max-width: 100%;
      height: 100vh;
      background-color: white;
      box-shadow: -4px 0 25px rgba(0,0,0,0.1);
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    .drawer-overlay.open .drawer-content {
      right: 0;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
    }
    .drawer-footer {
      position: sticky;
      bottom: 0;
    }
    
    .btn-icon {
      padding: 0;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
    }
    .btn-icon:hover, .btn-icon:focus {
      background-color: var(--color-border);
      border-radius: 50%;
      outline: none;
    }
    
    .bg-primary-subtle { background-color: #dbeafe; }
    
    .timeline {
      position: relative;
      padding-left: 1rem;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 0.25rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--color-border);
    }
    .timeline-item {
      position: relative;
      margin-bottom: 1.5rem;
    }
    .timeline-marker {
      position: absolute;
      left: -1rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      top: 0.25rem;
    }
    .font-xs { font-size: 0.75rem; }
    
    .text-danger { color: #ef4444 !important; }
    .text-warning { color: #f59e0b !important; }
    .text-success { color: #10b981 !important; }
  `]
})
export class GoalDetailsDrawerComponent {
  @Input() isOpen = false;
  @Input() goal: Goal | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() editGoal = new EventEmitter<Goal>();
  @Output() deleteGoal = new EventEmitter<Goal>();
  @Output() recordProgress = new EventEmitter<Goal>();

  trackByHistory(index: number, entry: GoalProgressEntry): string {
    return entry.id;
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'High': return 'text-danger';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-success';
      default: return '';
    }
  }
}
