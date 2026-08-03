import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, catchError, of, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { Challenge, ChallengeStats } from '../../../../../models/challenge.models';
import { CHALLENGE_TYPES } from '../../shared/challenge-types.config';
import { CarbonCategory } from '../../../../../models/carbon-category.models';

@Component({
  selector: 'app-admin-challenges-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      
      <!-- Top Actions -->
      <div class="header-actions">
        <button class="btn btn-outline" (click)="importTemplate()">
          <span class="material-icons">upload</span> Import Template
        </button>
        <button class="btn btn-success" (click)="createChallenge()">
          <span class="material-icons">add</span> Create Challenge <span class="material-icons" style="font-size: 16px; margin-left:4px;">expand_more</span>
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats() as s">
        <div class="stat-card">
          <div class="stat-icon-wrapper text-green"><span class="material-icons">description</span></div>
          <div class="stat-label">Total Challenges</div>
          <div class="stat-value">{{ s.totalChallenges || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-green"><span class="material-icons">play_circle</span></div>
          <div class="stat-label">Active Challenges</div>
          <div class="stat-value">{{ s.activeCount || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-orange"><span class="material-icons">calendar_today</span></div>
          <div class="stat-label">Scheduled</div>
          <div class="stat-value">{{ s.scheduledCount || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-blue"><span class="material-icons">check_circle</span></div>
          <div class="stat-label">Completed</div>
          <div class="stat-value">{{ s.completedCount || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-indigo"><span class="material-icons">people</span></div>
          <div class="stat-label">Total Participants</div>
          <div class="stat-value">{{ formatNumber(s.totalParticipants || 0) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-red"><span class="material-icons">pie_chart</span></div>
          <div class="stat-label">Completion Rate</div>
          <div class="stat-value">{{ s.completionRate || 0 }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-purple"><span class="material-icons">star_outline</span></div>
          <div class="stat-label">XP Distributed</div>
          <div class="stat-value">{{ formatNumber(s.xpDistributed || 0) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper text-green"><span class="material-icons">eco</span></div>
          <div class="stat-label">CO₂ Impact (kg)</div>
          <div class="stat-value">{{ s.co2Impact || 0 }} Ton</div>
        </div>
      </div>

      <div class="main-content">
        <!-- Active Challenges List -->
        <div class="content-left">
          <div class="card active-challenges-card">
            <div class="card-header">
              <div class="header-titles">
                <h2>Active Challenges <span class="badge-count">{{ stats()?.activeCount || 0 }}</span></h2>
                <p class="subtitle">Challenges that are currently running</p>
              </div>
              <div class="header-filters">
                <a href="#" class="view-all" (click)="$event.preventDefault(); goToLibrary()">View all</a>
                <select class="form-select"><option>All Categories</option></select>
                <select class="form-select"><option>Sort: Newest</option></select>
              </div>
            </div>
            <div class="challenge-list">
              <div class="challenge-row" *ngFor="let c of recentChallenges()">
                <div class="c-info">
                  <div class="c-thumb" [ngClass]="getChallengeTypeConfig(c.typeCode).bgClass">
                    <span class="material-icons">{{ getChallengeTypeConfig(c.typeCode).icon }}</span>
                  </div>
                  <div class="c-details">
                    <h4>{{ c.title }}</h4>
                    <span class="c-category">
                      <span class="material-icons">style</span> {{ getChallengeTypeConfig(c.typeCode).label }}
                      <ng-container *ngIf="c.trackingMethod === 'AUTOMATIC'">
                        <span style="margin-left: 0.5rem; color: #10b981; display: flex; align-items: center; gap: 0.25rem;">
                          <span class="material-icons">eco</span> {{ getCarbonCategoryName(c.linkedCategoryId) }}
                        </span>
                      </ng-container>
                    </span>
                  </div>
                </div>
                <div class="c-method">
                  <span class="badge method-{{ c.trackingMethod | lowercase }}">{{ c.trackingMethod | lowercase }}</span>
                </div>
                <div class="c-participants">
                  <strong>{{ c.participantCount || 0 }}</strong>
                  <span>Participants</span>
                </div>
                <div class="c-progress">
                  <div class="progress-info">
                    <span class="percent">{{ getCompletionPercent(c) }}%</span>
                    <span class="days-left">{{ getDaysLeft(c.endDate) }} days left</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" [style.width.%]="getCompletionPercent(c)" [ngClass]="getProgressColor(getCompletionPercent(c))"></div>
                  </div>
                </div>
                <div class="c-actions">
                  <button class="icon-btn"><span class="material-icons">more_vert</span></button>
                </div>
              </div>

              <!-- Fallback if empty -->
              <div class="empty-state" *ngIf="recentChallenges().length === 0">
                No active challenges found.
              </div>
            </div>
            
            <div class="card-footer">
              <span class="showing-text">Showing 1 to 5 of {{ stats()?.activeCount || 0 }} active challenges</span>
              <div class="pagination-controls">
                <button class="page-btn"><span class="material-icons">chevron_left</span></button>
                <button class="page-btn active">1</button>
                <button class="page-btn">2</button>
                <button class="page-btn">3</button>
                <button class="page-btn"><span class="material-icons">chevron_right</span></button>
                <select class="form-select page-size"><option>5 / page</option></select>
              </div>
            </div>
          </div>
        </div>

        <div class="content-right">
          <!-- Upcoming Challenges -->
          <div class="card upcoming-card">
            <div class="card-header mini">
              <h2>Upcoming Challenges <span class="badge-count">{{ stats()?.scheduledCount || 0 }}</span></h2>
              <a href="#" class="view-all">View all</a>
            </div>
            <div class="upcoming-list">
              <div class="upcoming-item" *ngFor="let u of upcomingChallenges()">
                <span class="material-icons event-icon">event</span>
                <div class="u-details">
                  <h4>{{ u.title }}</h4>
                  <span class="u-date"><span class="material-icons">calendar_today</span> {{ formatDate(u.startDate) }}</span>
                </div>
                <span class="starts-in">Starts in {{ getDaysLeft(u.startDate) }} days</span>
              </div>
              <div class="empty-state" *ngIf="upcomingChallenges().length === 0" style="padding: 1rem; color: #64748b; font-size: 0.875rem;">
                No upcoming challenges found.
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card activity-card">
            <div class="card-header mini">
              <h2>Recent Activity</h2>
              <a href="#" class="view-all">View all</a>
            </div>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let a of activities()">
                <div class="a-icon" [ngClass]="a.type"><span class="material-icons">{{ a.icon }}</span></div>
                <div class="a-content">
                  <p [innerHTML]="a.text"></p>
                  <span class="a-time">{{ a.time }}</span>
                </div>
              </div>
              <div class="empty-state" *ngIf="activities().length === 0" style="padding: 1rem; color: #64748b; font-size: 0.875rem;">
                No recent activity found.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h3>Quick Actions</h3>
        <div class="quick-actions-grid">
          <div class="action-card bg-green-light" (click)="createChallenge()">
            <div class="ac-icon text-green"><span class="material-icons">add_circle_outline</span></div>
            <div class="ac-text">
              <h4>Create Challenge</h4>
              <p>Start a new challenge</p>
            </div>
            <span class="material-icons arrow">arrow_forward</span>
          </div>
          <div class="action-card bg-blue-light" (click)="goToLibrary()">
            <div class="ac-icon text-blue"><span class="material-icons">article</span></div>
            <div class="ac-text">
              <h4>Challenge Library</h4>
              <p>View all challenges</p>
            </div>
            <span class="material-icons arrow">arrow_forward</span>
          </div>
          <div class="action-card bg-purple-light">
            <div class="ac-icon text-purple"><span class="material-icons">grid_view</span></div>
            <div class="ac-text">
              <h4>Manage Templates</h4>
              <p>Create & edit templates</p>
            </div>
            <span class="material-icons arrow">arrow_forward</span>
          </div>
          <div class="action-card bg-orange-light" routerLink="/admin/challenges/analytics">
            <div class="ac-icon text-orange"><span class="material-icons">bar_chart</span></div>
            <div class="ac-text">
              <h4>View Analytics</h4>
              <p>Challenge insights</p>
            </div>
            <span class="material-icons arrow">arrow_forward</span>
          </div>
          <div class="action-card bg-teal-light">
            <div class="ac-icon text-teal"><span class="material-icons">inventory_2</span></div>
            <div class="ac-text">
              <h4>Archived Challenges</h4>
              <p>View archived items</p>
            </div>
            <span class="material-icons arrow">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1440px;
      margin: 0 auto;
      background: #fafafa;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
    }

    /* Buttons */
    .header-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-outline {
      background: white;
      border-color: #cbd5e1;
      color: #16a34a;
    }
    .btn-outline:hover { background: #f8fafc; }
    .btn-success {
      background: #059669;
      color: white;
    }
    .btn-success:hover { background: #047857; }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
    }
    .stat-icon-wrapper {
      width: 40px; height: 40px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      background: #f8fafc;
    }
    .text-green { color: #10b981; }
    .text-orange { color: #f59e0b; }
    .text-blue { color: #3b82f6; }
    .text-indigo { color: #6366f1; }
    .text-red { color: #ef4444; }
    .text-purple { color: #8b5cf6; }
    .text-teal { color: #14b8a6; }

    .stat-label { font-size: 0.75rem; color: #64748b; font-weight: 500; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .stat-trend { font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 0.125rem; }
    .trend-up { color: #10b981; }
    .trend-up .material-icons { font-size: 0.875rem; }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 1024px) { .main-content { grid-template-columns: 1fr; } }
    
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header.mini { padding: 1.25rem; }
    .header-titles h2 { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .badge-count { background: #f1f5f9; color: #64748b; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 12px; font-weight: 600; }
    .header-titles .subtitle { font-size: 0.8125rem; color: #64748b; margin: 0; }
    
    .header-filters { display: flex; align-items: center; gap: 1rem; }
    .view-all { color: #059669; font-size: 0.875rem; font-weight: 600; text-decoration: none; }
    .view-all:hover { text-decoration: underline; }
    .form-select { padding: 0.375rem 2rem 0.375rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8125rem; color: #475569; background-color: #fff; }

    /* Challenge List */
    .challenge-list { display: flex; flex-direction: column; }
    .challenge-row {
      display: flex;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      gap: 1rem;
    }
    .challenge-row:last-child { border-bottom: none; }
    
    .c-info { flex: 2; display: flex; align-items: center; gap: 1rem; }
    .c-thumb { width: 64px; height: 48px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
    .bg-transportation { background: var(--ch-orange, #f59e0b); }
    .bg-energy { background: var(--ch-green, #10b981); }
    .bg-water { background: var(--ch-blue, #3b82f6); }
    .bg-waste { background: var(--ch-teal, #14b8a6); }
    .bg-community { background: var(--ch-blue, #3b82f6); }
    .bg-seasonal { background: var(--ch-orange, #f59e0b); }
    .bg-fuel { background: var(--ch-red, #ef4444); }
    .bg-food { background: var(--ch-yellow, #eab308); }
    .bg-shopping { background: var(--ch-pink, #ec4899); }
    .bg-travel { background: var(--ch-cyan, #06b6d4); }

    .c-details h4 { margin: 0 0 0.25rem 0; font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
    .c-category { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 0.25rem; }
    .c-category .material-icons { font-size: 0.875rem; color: #10b981; }
    
    .c-method { flex: 1; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .method-automatic { background: #dcfce3; color: #16a34a; }
    .method-manual { background: #dbeafe; color: #2563eb; }

    .c-participants { flex: 1; display: flex; flex-direction: column; }
    .c-participants strong { font-size: 0.9375rem; color: #0f172a; }
    .c-participants span { font-size: 0.75rem; color: #64748b; }

    .c-progress { flex: 1.5; display: flex; flex-direction: column; gap: 0.375rem; }
    .progress-info { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; }
    .progress-info .percent { color: #0f172a; }
    .progress-info .days-left { color: #94a3b8; font-weight: 500; }
    .progress-bar-bg { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .progress-bar-fill { height: 100%; border-radius: 3px; }
    .fill-green { background: #10b981; }
    .fill-blue { background: #3b82f6; }

    .c-actions { margin-left: auto; }
    .icon-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
    .icon-btn:hover { color: #475569; }

    /* Footer */
    .card-footer { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
    .showing-text { font-size: 0.8125rem; color: #64748b; }
    .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
    .page-btn { padding: 0.375rem 0.625rem; background: white; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.8125rem; cursor: pointer; color: #475569; }
    .page-btn.active { background: #059669; color: white; border-color: #059669; }
    .page-size { padding: 0.375rem 1.5rem 0.375rem 0.75rem; font-size: 0.8125rem; border: 1px solid #e2e8f0; border-radius: 4px; margin-left: 0.5rem; }

    /* Upcoming / Recent */
    .upcoming-list, .activity-list { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .upcoming-item { display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
    .upcoming-item:last-child { border-bottom: none; padding-bottom: 0; }
    .event-icon { color: #64748b; }
    .u-details { flex: 1; }
    .u-details h4 { margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    .u-date { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 0.25rem; }
    .u-date .material-icons { font-size: 0.75rem; }
    .starts-in { font-size: 0.75rem; font-weight: 600; color: #f59e0b; background: #fef3c7; padding: 0.25rem 0.5rem; border-radius: 4px; }

    .activity-card { margin-top: 1.5rem; }
    .activity-item { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
    .activity-item:last-child { border-bottom: none; padding-bottom: 0; }
    .a-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .a-icon.success { background: #dcfce3; color: #16a34a; }
    .a-icon.info { background: #e0e7ff; color: #4f46e5; }
    .a-icon.warning { background: #fef3c7; color: #d97706; }
    .a-icon.schedule { background: #dbeafe; color: #2563eb; }
    .a-icon .material-icons { font-size: 1rem; }
    
    .a-content p { margin: 0 0 0.25rem 0; font-size: 0.8125rem; color: #334155; line-height: 1.4; }
    .a-content p strong { color: #0f172a; }
    .a-time { font-size: 0.75rem; color: #94a3b8; }

    /* Quick Actions */
    .quick-actions-section h3 { font-size: 1.125rem; margin: 0 0 1rem 0; color: #0f172a; }
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
    }
    @media (max-width: 1024px) { .quick-actions-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .quick-actions-grid { grid-template-columns: repeat(2, 1fr); } }
    
    .action-card {
      display: flex; align-items: center; padding: 1rem; border-radius: 12px; cursor: pointer; transition: transform 0.2s;
    }
    .action-card:hover { transform: translateY(-2px); }
    
    .bg-green-light { background: #ecfdf5; border: 1px solid #d1fae5; }
    .bg-blue-light { background: #eff6ff; border: 1px solid #dbeafe; }
    .bg-purple-light { background: #f5f3ff; border: 1px solid #ede9fe; }
    .bg-orange-light { background: #fffbeb; border: 1px solid #fef3c7; }
    .bg-teal-light { background: #f0fdfa; border: 1px solid #ccfbf1; }

    .ac-icon {
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 0.75rem; background: white;
    }
    .ac-text { flex: 1; }
    .ac-text h4 { margin: 0 0 0.125rem 0; font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    .ac-text p { margin: 0; font-size: 0.75rem; color: #64748b; }
    .arrow { margin-left: auto; color: #94a3b8; font-size: 1.25rem; }
  `]
})
export class OverviewComponent implements OnInit {
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  stats = signal<ChallengeStats | null>(null);
  recentChallenges = signal<Challenge[]>([]);
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);

  upcomingChallenges = signal<Challenge[]>([]);
  carbonCategories = signal<CarbonCategory[]>([]);

  activities = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.apiError.set(false);

    forkJoin({
      stats: this.challengeService.getChallengeStats().pipe(catchError(() => of(null))),
      recent: this.challengeService.getChallenges(0, 5, undefined, 'ACTIVE').pipe(catchError(() => of(null))),
      upcoming: this.challengeService.getChallenges(0, 5, undefined, 'UPCOMING').pipe(catchError(() => of(null))),
      categories: this.challengeService.getCarbonCategories().pipe(catchError(() => of([])))
    })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))
    )
    .subscribe({
      next: (data: any) => {
        if (!data.stats && !data.recent) {
          this.apiError.set(true);
          this.toast.error('Failed to load dashboard data.');
        } else {
          if (data.stats) this.stats.set(data.stats);
          if (data.recent) {
            this.recentChallenges.set(data.recent.content);
            const generatedActivities = data.recent.content.map((c: any) => ({
              type: 'success', icon: 'check_circle', text: `<strong>"${c.title}"</strong> is actively running`, time: 'Recently'
            }));
            this.activities.set(generatedActivities);
          }
          if (data.upcoming) {
            this.upcomingChallenges.set(data.upcoming.content);
            const upcomingActivities = data.upcoming.content.map((c: any) => ({
              type: 'schedule', icon: 'event', text: `<strong>"${c.title}"</strong> is scheduled`, time: 'Upcoming'
            }));
            this.activities.update(acts => [...acts, ...upcomingActivities]);
          }
          if (data.categories) this.carbonCategories.set(data.categories);
        }
      }
    });
  }

  createChallenge() {
    this.router.navigate(['/admin/challenges/wizard']);
  }

  goToLibrary() {
    this.router.navigate(['/admin/challenges/library']);
  }
  
  importTemplate() {
    this.toast.info('Import Template feature coming soon.');
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getCompletionPercent(c: Challenge): number {
    if (!c.targetValue || c.targetValue === 0) return 0;
    const p = Math.round(((c.communityProgress || 0) / c.targetValue) * 100);
    return p > 100 ? 100 : p;
  }
  
  getDaysLeft(endDate: string): number {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getProgressColor(percent: number): string {
    return percent > 50 ? 'fill-green' : 'fill-blue';
  }
  
  getChallengeTypeConfig(typeCode: string): any {
    return CHALLENGE_TYPES[typeCode] || CHALLENGE_TYPES['COMMUNITY'];
  }

  getCarbonCategoryName(id: number | null | undefined): string {
    if (!id) return 'Unknown';
    const cat = this.carbonCategories().find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }
}
