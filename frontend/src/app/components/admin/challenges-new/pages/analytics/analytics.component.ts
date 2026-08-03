import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { Challenge, ChallengeStats, ChallengeAnalytics } from '../../../../../models/challenge.models';
import { forkJoin, catchError, of, finalize } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { CHALLENGE_TYPES } from '../../shared/challenge-types.config';
import { CarbonCategory } from '../../../../../models/carbon-category.models';

@Component({
  selector: 'app-admin-challenges-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  styleUrls: ['../../shared/badges.css'],
  template: `
    <div class="analytics-container">
      <div class="page-header">
        <div class="title-section">
          <h1>Challenge Analytics</h1>
          <p class="subtitle">Comprehensive performance metrics across all Challenges.</p>
        </div>
        <div class="actions-section">
          <select [ngModel]="dateRange()" (ngModelChange)="dateRange.set($event)" class="date-filter form-control">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
            <option value="all">All time</option>
          </select>
          <button class="btn btn-outline" title="Coming soon" disabled>
            <span class="material-icons">download</span> Export CSV
          </button>
        </div>
      </div>

      <div class="error-banner" *ngIf="apiError()">
        Failed to load analytics data. <button (click)="loadData()">Retry</button>
      </div>

      <div class="loading-state" *ngIf="loading() && !apiError()">
        <div class="spinner"></div>
        <p>Loading analytics...</p>
      </div>

      <ng-container *ngIf="!loading() && !apiError()">
        
        <div class="stats-row">
          <div class="stat-card">
            <span class="material-icons icon-bg-blue">flag</span>
            <div class="stat-content">
              <span class="stat-label">Total Challenges</span>
              <span class="stat-value">{{ stats()?.totalChallenges || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-indigo">group</span>
            <div class="stat-content">
              <span class="stat-label">Total Participants</span>
              <span class="stat-value">{{ stats()?.totalParticipants || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-green">check_circle</span>
            <div class="stat-content">
              <span class="stat-label">Avg Completion Rate</span>
              <span class="stat-value">{{ derivedAvgCompletionRate() }}%</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-yellow">star</span>
            <div class="stat-content">
              <span class="stat-label">Total XP Distributed</span>
              <span class="stat-value">{{ derivedTotalXp() }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-emerald">eco</span>
            <div class="stat-content">
              <span class="stat-label">Total CO₂ Impact</span>
              <span class="stat-value">{{ derivedTotalImpact() }} kg</span>
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-card">
            <h3>Category Distribution</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="categoryChartData"
                [options]="donutChartOptions"
                [type]="'doughnut'">
              </canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3>Participation Trend</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="trendChartData"
                [options]="lineChartOptions"
                [type]="'line'">
              </canvas>
            </div>
          </div>
        </div>

        <div class="table-card">
          <div class="card-header">
            <h3>Per-Challenge Breakdown</h3>
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="form-control status-filter">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type & Category</th>
                  <th>Tracking Method</th>
                  <th>Status</th>
                  <th>Date Range</th>
                  <th>Participants</th>
                  <th>Completion Rate</th>
                  <th>XP Awarded</th>
                  <th class="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of paginatedChallenges()">
                  <td class="font-medium">{{ c.title }}</td>
                  <td>
                    <span class="type-badge">{{ getChallengeTypeConfig(c.typeCode).label }}</span>
                    <span class="type-badge category-badge" *ngIf="c.trackingMethod === 'AUTOMATIC'" style="margin-left: 0.5rem; background: #ecfdf5; color: #10b981;">
                      {{ getCarbonCategoryName(c.linkedCategoryId) }}
                    </span>
                  </td>
                  <td>{{ c.trackingMethod }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="c.status.toLowerCase()">
                      {{ c.status }}
                    </span>
                  </td>
                  <td>
                    <div class="date-cell">
                      <span>{{ c.startDate | date:'MMM d' }}</span>
                      <span class="material-icons date-arrow">arrow_right_alt</span>
                      <span>{{ c.endDate | date:'MMM d' }}</span>
                    </div>
                  </td>
                  <td>{{ c.participantCount || 0 }}</td>
                  <td>{{ c.communityProgress || 0 }}</td>
                  <td>{{ (c.participantCount || 0) * c.rewardXp }}</td>
                  <td class="actions-cell">
                    <button class="btn-link" (click)="viewInLibrary(c.id)">View</button>
                  </td>
                </tr>
                <tr *ngIf="paginatedChallenges().length === 0">
                  <td colspan="9" class="empty-cell">No challenges found matching the criteria.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" *ngIf="filteredChallenges().length > pageSize">
            <button [disabled]="currentPage() === 0" (click)="currentPage.set(currentPage() - 1)">Previous</button>
            <span>Page {{ currentPage() + 1 }} of {{ Math.ceil(filteredChallenges().length / pageSize) }}</span>
            <button [disabled]="(currentPage() + 1) * pageSize >= filteredChallenges().length" (click)="currentPage.set(currentPage() + 1)">Next</button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .analytics-container { padding: 2rem; max-width: 1400px; margin: 0 auto; color: #0f172a; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .title-section h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 0.5rem 0; letter-spacing: -0.025em; }
    .subtitle { color: #64748b; margin: 0; font-size: 1rem; }
    
    .actions-section { display: flex; gap: 1rem; align-items: center; }
    .form-control { padding: 0.5rem 2.5rem 0.5rem 1rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; background: #fff; appearance: none; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
    .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .stat-card .material-icons { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    
    .icon-bg-blue { background: #dbeafe; color: #2563eb; }
    .icon-bg-indigo { background: #e0e7ff; color: #4f46e5; }
    .icon-bg-green { background: #dcfce3; color: #16a34a; }
    .icon-bg-yellow { background: #fef9c3; color: #ca8a04; }
    .icon-bg-emerald { background: #d1fae5; color: #059669; }
    
    .stat-content { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.875rem; color: #64748b; font-weight: 500; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; line-height: 1; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 2rem; }
    .chart-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .chart-card h3 { margin: 0 0 1.5rem 0; font-size: 1.125rem; color: #0f172a; }
    .chart-wrapper { position: relative; height: 300px; width: 100%; display: flex; justify-content: center; }
    
    .table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; }
    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { margin: 0; font-size: 1.125rem; color: #0f172a; }
    
    .table-responsive { width: 100%; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
    .data-table th { padding: 1rem 1.5rem; background: #f8fafc; color: #475569; font-weight: 600; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.875rem; }
    
    .font-medium { font-weight: 500; color: #0f172a; }
    .type-badge { font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .date-cell { display: flex; align-items: center; gap: 0.25rem; color: #64748b; }
    .date-arrow { font-size: 1rem; color: #94a3b8; }
    
    .btn-link { background: none; border: none; color: #2563eb; cursor: pointer; font-weight: 500; padding: 0; }
    .btn-link:hover { text-decoration: underline; }
    
    .empty-cell { text-align: center; color: #64748b; padding: 3rem !important; }
    
    .pagination { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; background: white; }
    .pagination button { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer; color: #475569; font-size: 0.875rem; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination span { font-size: 0.875rem; color: #64748b; }
    
    .error-banner { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border: 1px solid #fca5a5; }
    .error-banner button { background: white; border: 1px solid #fca5a5; border-radius: 4px; padding: 0.25rem 0.75rem; cursor: pointer; color: #991b1b; }
    
    .loading-state { text-align: center; padding: 4rem; color: #64748b; }
    .spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid #e2e8f0; border-radius: 50%; border-top-color: #2563eb; animation: spin 1s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AnalyticsComponent implements OnInit {
  Math = Math;
  private challengeService = inject(AdminChallengeService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  dateRange = signal<string>('30');
  statusFilter = signal<string>('');
  
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);
  
  stats = signal<ChallengeStats | null>(null);
  allChallenges = signal<Challenge[]>([]);
  analytics = signal<ChallengeAnalytics | null>(null);
  carbonCategories = signal<CarbonCategory[]>([]);
  
  currentPage = signal<number>(0);
  pageSize = 10;

  filteredChallenges = computed(() => {
    let list = this.allChallenges();
    const status = this.statusFilter();
    if (status) {
      list = list.filter(c => c.status === status);
    }
    // Default sort by real Participants
    return list.sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0));
  });

  paginatedChallenges = computed(() => {
    const list = this.filteredChallenges();
    const start = this.currentPage() * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  // Derived stats
  derivedAvgCompletionRate = computed(() => {
    if (this.allChallenges().length === 0) return 0;
    return Math.round(this.allChallenges().reduce((acc, c) => acc + (Number(c.communityProgress) || 0), 0) / this.allChallenges().length);
  });

  derivedTotalXp = computed(() => {
    return this.allChallenges().reduce((acc, c) => acc + ((c.participantCount || 0) * c.rewardXp), 0);
  });

  derivedTotalImpact = computed(() => {
    return this.allChallenges().reduce((acc, c) => acc + (c.communityProgress || 0), 0);
  });

  categoryChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['COMMUNITY', 'SEASONAL'],
    datasets: [
      {
        data: [65, 35], // Mock fallback
        backgroundColor: ['#2563eb', '#10b981'],
        borderWidth: 0
      }
    ]
  };
  
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  trendChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        data: [0,0,0,0], // Initial empty
        label: 'New Participants',
        fill: true,
        tension: 0.4,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)'
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, border: { dash: [4, 4] }, grid: { color: '#e2e8f0' } },
      x: { grid: { display: false } }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.apiError.set(false);
    
    forkJoin({
      stats: this.challengeService.getChallengeStats(),
      analytics: this.challengeService.getChallengeAnalytics(),
      // Fetch up to 100 for the analytics breakdown per UX-07 MVP specification
      challenges: this.challengeService.getChallenges(0, 100),
      categories: this.challengeService.getCarbonCategories().pipe(catchError(() => of([])))
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        this.apiError.set(true);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(result => {
      if (result) {
        this.stats.set(result.stats);
        this.analytics.set(result.analytics);
        this.allChallenges.set(result.challenges.content);
        if (result.categories) this.carbonCategories.set(result.categories);
        this.updateCharts(result.challenges.content, result.analytics);
      }
    });
  }

  updateCharts(challenges: Challenge[], analytics: ChallengeAnalytics) {
    // Compute category distribution
    const catMap = new Map<string, number>();
    challenges.forEach(c => {
      const label = c.trackingMethod === 'AUTOMATIC' 
        ? this.getCarbonCategoryName(c.linkedCategoryId) 
        : this.getChallengeTypeConfig(c.typeCode).label;
      catMap.set(label, (catMap.get(label) || 0) + 1);
    });
    
    this.categoryChartData = {
      labels: Array.from(catMap.keys()),
      datasets: [{
        data: Array.from(catMap.values()),
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
        borderWidth: 0
      }]
    };

    // Use participationByMonth for trend chart if available, otherwise mock
    const labels = Object.keys(analytics.participationByMonth);
    const data = Object.values(analytics.participationByMonth) as number[];
    
    if (labels.length > 0) {
      this.trendChartData = {
        labels,
        datasets: [{
          data,
          label: 'New Participants',
          fill: true,
          tension: 0.4,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)'
        }]
      };
    }
  }

  viewInLibrary(id: number) {
    // Wait for route navigation, the viewChallenge logic in LibraryComponent is handled by query parameters in an ideal world,
    // but per MVP we navigate to library and they can manually view.
    this.router.navigate(['/admin/challenges', 'library']);
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
