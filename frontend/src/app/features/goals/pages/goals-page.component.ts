import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { GoalsOverviewComponent } from '../components/goals-overview/goals-overview.component';
import { GoalsListComponent } from '../components/goals-list/goals-list.component';
import { GoalsRightPanelComponent } from '../components/goals-right-panel/goals-right-panel.component';
import { GoalDetailsDrawerComponent } from '../components/goal-details-drawer/goal-details-drawer.component';
import { CreateGoalDialogComponent } from '../dialogs/create-goal-dialog/create-goal-dialog.component';
import { ProgressUpdateDialogComponent } from '../dialogs/progress-update-dialog/progress-update-dialog.component';
import { GoalService } from '../services/goal.service';
import { Goal } from '../interfaces/goal.interface';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-goals-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    SidebarComponent, 
    GoalsOverviewComponent, 
    GoalsListComponent,
    GoalsRightPanelComponent,
    GoalDetailsDrawerComponent,
    MatDialogModule,
    LucideAngularModule
  ],
  template: `
    <div class="container-fluid bg-light min-vh-100">
      <div class="row min-vh-100">
        
        <!-- Sidebar -->
        <div class="col-md-3 col-xl-2 p-0 bg-white border-end d-none d-md-block" style="min-height: 100vh;">
          <app-sidebar></app-sidebar>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 col-xl-10 p-0">
          <div class="p-4 p-md-5">
            
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
              <div>
                <h2 class="fw-bold mb-1">Goals</h2>
                <p class="text-muted mb-0">Set, track, and achieve your sustainability goals.</p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-light premium-btn d-flex align-items-center gap-2" aria-label="View Achievements">
                  <lucide-icon name="trophy" [size]="18" class="text-warning"></lucide-icon>
                  View Achievements
                </button>
                <button class="premium-btn premium-btn-primary" (click)="openCreateDialog()" aria-label="Create Goal">
                  <lucide-icon name="plus" [size]="18"></lucide-icon>
                  Create Goal
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="goalService.loading()" class="row g-4">
              <div class="col-12">
                <div class="card premium-card p-4">
                  <div class="d-flex align-items-center gap-3 mb-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <h5 class="mb-0 text-muted">Loading your goals...</h5>
                  </div>
                  <!-- Skeleton Cards -->
                  <div class="row g-4">
                    <div class="col-md-3" *ngFor="let i of [1,2,3,4]">
                      <div class="bg-secondary bg-opacity-10 rounded" style="height: 100px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="goalService.error() && !goalService.loading()" class="alert alert-danger d-flex align-items-center justify-content-between premium-card">
              <div class="d-flex align-items-center gap-3">
                <lucide-icon name="alert-circle" class="text-danger"></lucide-icon>
                <span>{{ goalService.error() }}</span>
              </div>
              <button class="btn btn-outline-danger btn-sm" (click)="retryLoad()" aria-label="Retry loading goals">Retry</button>
            </div>

            <!-- Dashboard Layout (Loaded successfully) -->
            <div class="row g-4" *ngIf="!goalService.loading() && !goalService.error()">
              <!-- Left Column: Overview + List -->
              <div class="col-xl-8 col-lg-12">
                <app-goals-overview></app-goals-overview>
                <app-goals-list (goalSelected)="openDrawer($event)"></app-goals-list>
              </div>

              <!-- Right Column: Analytics & Progress -->
              <div class="col-xl-4 col-lg-12">
                <app-goals-right-panel></app-goals-right-panel>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Drawer Overlay -->
    <app-goal-details-drawer 
      [isOpen]="isDrawerOpen()" 
      [goal]="selectedGoal()"
      (close)="closeDrawer()"
      (editGoal)="openEditDialog($event)"
      (deleteGoal)="deleteGoal($event)"
      (recordProgress)="openProgressDialog($event)">
    </app-goal-details-drawer>
  `
})
export class GoalsPageComponent implements OnInit {
  dialog = inject(MatDialog);
  goalService = inject(GoalService);

  isDrawerOpen = signal(false);
  selectedGoal = signal<Goal | null>(null);

  ngOnInit() {
    this.goalService.loadGoals().subscribe();
  }

  retryLoad() {
    this.goalService.loadGoals().subscribe();
  }

  openDrawer(goal: Goal) {
    this.selectedGoal.set(goal);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
    setTimeout(() => this.selectedGoal.set(null), 300);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateGoalDialogComponent, {
      width: '500px',
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.goalService.createGoal(result).subscribe();
      }
    });
  }

  openEditDialog(goal: Goal) {
    const dialogRef = this.dialog.open(CreateGoalDialogComponent, {
      width: '500px',
      data: { goal },
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.goalService.updateGoal(goal.id, result).subscribe(updated => {
          if (this.selectedGoal()?.id === goal.id) {
            this.selectedGoal.set(updated);
          }
        });
      }
    });
  }

  openProgressDialog(goal: Goal) {
    const dialogRef = this.dialog.open(ProgressUpdateDialogComponent, {
      width: '400px',
      data: { goal },
      panelClass: 'premium-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.goalService.recordProgress(goal.id, result.value, result.note).subscribe(updated => {
          if (this.selectedGoal()?.id === goal.id) {
            this.selectedGoal.set(updated);
          }
        });
      }
    });
  }

  deleteGoal(goal: Goal) {
    if (confirm(`Are you sure you want to delete the goal "${goal.title}"?`)) {
      this.goalService.deleteGoal(goal.id).subscribe(() => {
        this.closeDrawer();
      });
    }
  }
}
