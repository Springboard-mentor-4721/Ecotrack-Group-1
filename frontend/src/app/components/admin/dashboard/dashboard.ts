import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, catchError, of, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../challenges-new/services/admin-challenge.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Challenge } from '../../../models/challenge.models';
import { AdminService, AdminDashboardPulseDTO } from '../../../services/admin.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-titles">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and operational tasks</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="createChallenge()">
            <span class="material-icons">add</span> Create Challenge
          </button>
        </div>
      </div>

      <!-- Loading / Error states for Pulse -->
      <div *ngIf="loadingPulse()" class="pulse-grid">
        <div class="pulse-card skeleton" *ngFor="let i of [1,2,3,4]">
          <div class="skeleton-icon"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text large"></div>
        </div>
      </div>

      <div *ngIf="apiError()" class="error-banner">
        <span class="material-icons">error_outline</span>
        <span>Failed to load dashboard data.</span>
        <button class="btn btn-sm" (click)="loadDashboard()">Retry</button>
      </div>

      <!-- Platform Pulse Grid -->
      <div class="pulse-grid" *ngIf="!loadingPulse() && !apiError() && pulse() as p">
        <div class="pulse-card">
          <div class="pulse-icon bg-indigo-light text-indigo">
            <span class="material-icons">group</span>
          </div>
          <div class="pulse-content">
            <div class="pulse-label">Total Users</div>
            <div class="pulse-value">{{ formatNumber(p.totalUsers) }}</div>
            <div class="pulse-desc">Registered platform users</div>
          </div>
        </div>
        <div class="pulse-card">
          <div class="pulse-icon bg-green-light text-green">
            <span class="material-icons">play_circle</span>
          </div>
          <div class="pulse-content">
            <div class="pulse-label">Active Challenges</div>
            <div class="pulse-value">{{ formatNumber(p.activeChallengesCount) }}</div>
            <div class="pulse-desc">Currently running</div>
          </div>
        </div>
        <div class="pulse-card">
          <div class="pulse-icon bg-orange-light text-orange">
            <span class="material-icons">event</span>
          </div>
          <div class="pulse-content">
            <div class="pulse-label">Upcoming Challenges</div>
            <div class="pulse-value">{{ formatNumber(p.upcomingChallengesCount) }}</div>
            <div class="pulse-desc">Scheduled to launch</div>
          </div>
        </div>
        <div class="pulse-card">
          <div class="pulse-icon bg-blue-light text-blue">
            <span class="material-icons">done_all</span>
          </div>
          <div class="pulse-content">
            <div class="pulse-label">Completed Challenges</div>
            <div class="pulse-value">{{ formatNumber(p.completedChallengesCount) }}</div>
            <div class="pulse-desc">Finished successfully</div>
          </div>
        </div>
      </div>

      <!-- Main Operational Focus -->
      <div class="operational-grid">
        <!-- Active Challenges -->
        <div class="card operational-card">
          <div class="card-header">
            <div class="header-titles">
              <h2>Active Challenges</h2>
              <p class="subtitle">Monitor running challenges</p>
            </div>
            <a href="#" class="view-all" (click)="$event.preventDefault(); goToLibrary('ACTIVE')">View all</a>
          </div>
          
          <div class="card-content">
            <div class="loading-spinner" *ngIf="loadingChallenges()">
              <div class="spinner"></div>
            </div>

            <div class="challenge-list" *ngIf="!loadingChallenges()">
              <div class="challenge-row" *ngFor="let c of recentChallenges()">
                <div class="c-icon" [ngClass]="!c.imageUrl ? getCategoryColorClass(c.linkedCategoryId) : ''" [ngStyle]="{'background': c.imageUrl ? 'url(' + resolveImageUrl(c.imageUrl) + ') center/cover no-repeat' : ''}">
                  <span class="material-icons" *ngIf="!c.imageUrl">{{ getCategoryIcon(c.linkedCategoryId) }}</span>
                </div>
                <div class="c-details">
                  <h4>{{ c.title }}</h4>
                  <span class="c-meta">
                    <span class="material-icons">group</span> {{ c.participantCount || 0 }} participants
                  </span>
                </div>
                <div class="c-status">
                  <span class="days-left">{{ getDaysLeft(c.endDate) }} days left</span>
                </div>
                <button class="btn-icon" (click)="goToChallenge(c.id)">
                  <span class="material-icons">arrow_forward</span>
                </button>
              </div>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="recentChallenges().length === 0">
                <span class="material-icons">inbox</span>
                <p>No active challenges</p>
                <button class="btn btn-outline" (click)="createChallenge()">Create Challenge</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Challenges -->
        <div class="card operational-card">
          <div class="card-header">
            <div class="header-titles">
              <h2>Upcoming Challenges</h2>
              <p class="subtitle">Next to launch</p>
            </div>
            <a href="#" class="view-all" (click)="$event.preventDefault(); goToLibrary('UPCOMING')">View all</a>
          </div>
          
          <div class="card-content">
            <div class="loading-spinner" *ngIf="loadingChallenges()">
              <div class="spinner"></div>
            </div>

            <div class="challenge-list" *ngIf="!loadingChallenges()">
              <div class="challenge-row" *ngFor="let u of upcomingChallenges()">
                <div class="c-icon" [ngClass]="!u.imageUrl ? 'bg-orange-light text-orange' : ''" [ngStyle]="{'background': u.imageUrl ? 'url(' + resolveImageUrl(u.imageUrl) + ') center/cover no-repeat' : ''}">
                  <span class="material-icons" *ngIf="!u.imageUrl">calendar_today</span>
                </div>
                <div class="c-details">
                  <h4>{{ u.title }}</h4>
                  <span class="c-meta">
                    <span class="material-icons">event</span> Starts {{ formatDate(u.startDate) }}
                  </span>
                </div>
                <div class="c-status">
                  <span class="starts-in">In {{ getDaysLeft(u.startDate) }} days</span>
                </div>
                <button class="btn-icon" (click)="goToChallenge(u.id)">
                  <span class="material-icons">arrow_forward</span>
                </button>
              </div>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="upcomingChallenges().length === 0">
                <span class="material-icons">event_busy</span>
                <p>No upcoming challenges</p>
                <button class="btn btn-outline" (click)="createChallenge()">Schedule Challenge</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h3>Quick Actions</h3>
        <div class="quick-actions-grid">
          <div class="action-card" (click)="createChallenge()">
            <div class="ac-icon bg-green-light text-green"><span class="material-icons">add_circle</span></div>
            <div class="ac-text">
              <h4>Create Challenge</h4>
              <p>Start a new challenge</p>
            </div>
          </div>
          <div class="action-card" (click)="goToLibrary()">
            <div class="ac-icon bg-blue-light text-blue"><span class="material-icons">article</span></div>
            <div class="ac-text">
              <h4>Challenge Library</h4>
              <p>Manage all challenges</p>
            </div>
          </div>
          <div class="action-card" routerLink="/admin/users">
            <div class="ac-icon bg-indigo-light text-indigo"><span class="material-icons">manage_accounts</span></div>
            <div class="ac-text">
              <h4>User Management</h4>
              <p>Manage platform users</p>
            </div>
          </div>
          <div class="action-card" routerLink="/admin/challenges/analytics">
            <div class="ac-icon bg-purple-light text-purple"><span class="material-icons">analytics</span></div>
            <div class="ac-text">
              <h4>View Analytics</h4>
              <p>Platform & challenge insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1440px;
      margin: 0 auto;
      background: transparent;
      min-height: calc(100vh - 80px);
      font-family: 'Inter', -apple-system, sans-serif;
      color: var(--text-primary);
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header-titles h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
    .header-titles p { font-size: 0.9375rem; color: var(--text-muted); margin: 0; }
    
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem;
      cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
    }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
    .btn-primary { background: var(--color-emerald); color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .btn-primary:hover { background: var(--color-emerald-dark, #059669); }
    .btn-outline { background: var(--bg-surface); border-color: var(--border-color); color: var(--text-secondary); }
    .btn-outline:hover { background: var(--bg-surface-hover); border-color: var(--text-muted); }
    .btn-icon { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 6px; transition: all 0.2s; }
    .btn-icon:hover { color: var(--text-primary); background: var(--bg-surface-hover); }

    /* Pulse Grid */
    .pulse-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;
    }
    @media (max-width: 1200px) { .pulse-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .pulse-grid { grid-template-columns: 1fr; } }
    
    .pulse-card {
      background: var(--bg-surface); border-radius: 16px; padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
      border: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 1.25rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .pulse-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
    }
    .pulse-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pulse-icon .material-icons { font-size: 1.5rem; }
    
    .pulse-content { display: flex; flex-direction: column; }
    .pulse-label { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; }
    .pulse-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 0.25rem; }
    .pulse-desc { font-size: 0.8125rem; color: var(--text-muted); }

    /* Skeletons */
    .skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    .skeleton-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--bg-surface-hover); }
    .skeleton-text { height: 16px; background: var(--bg-surface-hover); border-radius: 4px; width: 60%; margin-top: 0.5rem; }
    .skeleton-text.large { height: 32px; width: 40%; margin-top: 0.5rem; }

    /* Utilities */
    .bg-indigo-light { background: rgba(79, 70, 229, 0.12); } .text-indigo { color: #6366f1; }
    .bg-green-light { background: rgba(16, 185, 129, 0.12); } .text-green { color: #10b981; }
    .bg-orange-light { background: rgba(234, 88, 12, 0.12); } .text-orange { color: #ea580c; }
    .bg-blue-light { background: rgba(37, 99, 235, 0.12); } .text-blue { color: #2563eb; }
    .bg-purple-light { background: rgba(124, 58, 237, 0.12); } .text-purple { color: #7c3aed; }
    .bg-teal-light { background: rgba(13, 148, 136, 0.12); } .text-teal { color: #0d9488; }
    .bg-rose-light { background: rgba(225, 29, 72, 0.12); } .text-rose { color: #e11d48; }

    /* Operational Grid */
    .operational-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;
    }
    @media (max-width: 1200px) { .operational-grid { grid-template-columns: 1fr; } }
    
    .card {
      background: var(--bg-surface); border-radius: 16px; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
      border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden;
      transition: box-shadow 0.3s ease;
    }
    .card:hover {
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
    }
    .card-header {
      padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start;
    }
    .header-titles h2 { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--text-primary); }
    .subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
    .view-all { color: #2563eb; font-size: 0.875rem; font-weight: 600; text-decoration: none; transition: color 0.2s; }
    .view-all:hover { color: #1d4ed8; }

    /* Lists */
    .challenge-list { display: flex; flex-direction: column; }
    .challenge-row {
      display: flex; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); gap: 1rem; transition: background 0.2s;
    }
    .challenge-row:hover { background: var(--bg-surface-hover); }
    .challenge-row:last-child { border-bottom: none; }
    
    .c-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .c-icon .material-icons { font-size: 1.25rem; }
    
    .c-details { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .c-details h4 { margin: 0; font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .c-meta { font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.375rem; }
    .c-meta .material-icons { font-size: 0.9375rem; }
    
    .c-status { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-width: 100px; }
    .days-left { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
    .starts-in { font-size: 0.8125rem; font-weight: 600; color: #ea580c; background: rgba(234, 88, 12, 0.1); padding: 0.25rem 0.5rem; border-radius: 6px; }

    /* Empty State */
    .empty-state { padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .empty-state .material-icons { font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; }
    .empty-state p { margin: 0 0 1.25rem 0; font-size: 0.9375rem; color: var(--text-muted); font-weight: 500; }

    /* Error / Loading */
    .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #b91c1c; padding: 1rem 1.5rem; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem; }
    .error-banner .material-icons { font-size: 1.25rem; }
    .error-banner .btn-sm { margin-left: auto; background: var(--bg-surface); border-color: rgba(239,68,68,0.3); color: #b91c1c; }
    .loading-spinner { padding: 3rem; display: flex; justify-content: center; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: var(--text-primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Quick Actions */
    .quick-actions-section h3 { font-size: 1.125rem; font-weight: 700; margin: 0 0 1.25rem 0; color: var(--text-primary); }
    .quick-actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
    @media (max-width: 1024px) { .quick-actions-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .quick-actions-grid { grid-template-columns: 1fr; } }
    
    .action-card {
      background: var(--bg-surface); border-radius: 16px; padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem;
      border: 1px solid var(--border-color); cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
    }
    .action-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08), 0 8px 10px -5px rgba(0,0,0,0.04); 
      border-color: var(--border-color); 
    }
    .ac-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ac-text h4 { margin: 0 0 0.25rem 0; font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
    .ac-text p { margin: 0; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  pulse = signal<AdminDashboardPulseDTO | null>(null);
  loadingPulse = signal<boolean>(true);
  apiError = signal<boolean>(false);

  recentChallenges = signal<Challenge[]>([]);
  upcomingChallenges = signal<Challenge[]>([]);
  loadingChallenges = signal<boolean>(true);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loadingPulse.set(true);
    this.loadingChallenges.set(true);
    this.apiError.set(false);

    // 1. Fetch Pulse
    this.adminService.getDashboardPulse()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingPulse.set(false))
      )
      .subscribe({
        next: (data) => this.pulse.set(data),
        error: () => {
          this.apiError.set(true);
          this.toast.error('Failed to load platform pulse.');
        }
      });

    // 2. Fetch Operational Challenges (parallel)
    forkJoin({
      recent: this.challengeService.getChallenges(0, 5, undefined, 'ACTIVE').pipe(catchError(() => of(null))),
      upcoming: this.challengeService.getChallenges(0, 5, undefined, 'UPCOMING').pipe(catchError(() => of(null)))
    })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingChallenges.set(false))
    )
    .subscribe({
      next: (data: any) => {
        if (data.recent && data.recent.content) {
          this.recentChallenges.set(data.recent.content);
        }
        if (data.upcoming && data.upcoming.content) {
          this.upcomingChallenges.set(data.upcoming.content);
        }
      }
    });
  }

  createChallenge() {
    this.router.navigate(['/admin/challenges/create']);
  }

  goToLibrary(statusFilter?: string) {
    if (statusFilter) {
      this.router.navigate(['/admin/challenges'], { queryParams: { status: statusFilter } });
    } else {
      this.router.navigate(['/admin/challenges']);
    }
  }

  goToChallenge(id: number) {
    this.router.navigate(['/admin/challenges', id]);
  }

  formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
  
  getDaysLeft(endDate: any): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return encodeURI(url);
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    if (url.startsWith('uploads/')) {
      return encodeURI(`${baseUrl}/${url}`);
    }
    return encodeURI(`${baseUrl}/uploads/${url}`);
  }

  formatDate(d: string | Date): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getCategoryColorClass(categoryId: number | null | undefined): string {
    // Determine color based on ID just for some variety since we removed full category loading
    if (!categoryId) return 'bg-teal-light text-teal';
    const colors = ['bg-teal-light text-teal', 'bg-blue-light text-blue', 'bg-green-light text-green', 'bg-purple-light text-purple', 'bg-orange-light text-orange', 'bg-rose-light text-rose'];
    return colors[categoryId % colors.length];
  }

  getCategoryIcon(categoryId: number | null | undefined): string {
    if (!categoryId) return 'category';
    const icons = ['category', 'water_drop', 'bolt', 'recycling', 'directions_car', 'restaurant'];
    return icons[categoryId % icons.length];
  }
}
