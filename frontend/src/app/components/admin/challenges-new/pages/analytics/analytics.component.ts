import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, computed, effect } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { 
  AdminAnalyticsService, 
  AdminAnalyticsFilter, 
  AdminOverviewAnalyticsDTO, 
  AdminUserAnalyticsDTO, 
  AdminGamificationAnalyticsDTO, 
  AdminBadgeAnalyticsDTO, 
  AdminChallengeAnalyticsDTO, 
  AdminSustainabilityAnalyticsDTO,
  AnalyticsDistributionDTO,
  AnalyticsTrendPointDTO
} from '../../../../../services/admin-analytics.service';
import { catchError, finalize, of } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';

interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

@Component({
  selector: 'app-admin-challenges-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables()), DatePipe, DecimalPipe],
  template: `
    <div class="analytics-container">
      <div class="page-header">
        <div class="title-section">
          <h1>Admin Analytics</h1>
          <p class="subtitle">Monitor EcoTrack platform growth, engagement, gamification, challenges, and environmental impact.</p>
        </div>
        <div class="actions-section">
          <div class="custom-dropdown" tabindex="0" (blur)="isDropdownOpen.set(false)">
            <div class="dropdown-header form-control" (click)="isDropdownOpen.set(!isDropdownOpen())" [class.active]="isDropdownOpen()">
              {{ getDropdownLabel(dateRange()) }}
            </div>
            <div class="dropdown-options" *ngIf="isDropdownOpen()">
              <div class="dropdown-option" [class.selected]="dateRange() === 'all'" (mousedown)="selectDateRange('all'); $event.preventDefault();">All Time</div>
              <div class="dropdown-option" [class.selected]="dateRange() === '7'" (mousedown)="selectDateRange('7'); $event.preventDefault();">Last 7 Days</div>
              <div class="dropdown-option" [class.selected]="dateRange() === '30'" (mousedown)="selectDateRange('30'); $event.preventDefault();">Last 30 Days</div>
              <div class="dropdown-option" [class.selected]="dateRange() === '90'" (mousedown)="selectDateRange('90'); $event.preventDefault();">Last 90 Days</div>
              <div class="dropdown-option" [class.selected]="dateRange() === '365'" (mousedown)="selectDateRange('365'); $event.preventDefault();">This Year</div>
            </div>
          </div>
          <div class="custom-dropdown" tabindex="0" (blur)="isExportDropdownOpen.set(false)">
            <button class="btn btn-outline" [disabled]="isExporting()" (click)="isExportDropdownOpen.set(!isExportDropdownOpen())" style="padding-right: 0.5rem;">
              <span class="material-icons">download</span> 
              {{ isExporting() ? 'Exporting...' : 'Export Report' }}
              <span class="material-icons">arrow_drop_down</span>
            </button>
            <div class="dropdown-options" *ngIf="isExportDropdownOpen()">
              <div class="dropdown-option" (mousedown)="doExport('pdf'); $event.preventDefault();">
                <span class="material-icons" style="font-size: 1.1rem; margin-right: 0.5rem; vertical-align: middle;">picture_as_pdf</span> PDF Report
              </div>
              <div class="dropdown-option" (mousedown)="doExport('excel'); $event.preventDefault();">
                <span class="material-icons" style="font-size: 1.1rem; margin-right: 0.5rem; vertical-align: middle;">table_view</span> Excel Sheet
              </div>
              <div class="dropdown-option" (mousedown)="doExport('csv'); $event.preventDefault();">
                <span class="material-icons" style="font-size: 1.1rem; margin-right: 0.5rem; vertical-align: middle;">text_snippet</span> CSV (Zip)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <button [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Overview</button>
        <button [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">Users</button>
        <button [class.active]="activeTab() === 'gamification'" (click)="activeTab.set('gamification')">Gamification</button>
        <button [class.active]="activeTab() === 'badges'" (click)="activeTab.set('badges')">Badges</button>
        <button [class.active]="activeTab() === 'challenges'" (click)="activeTab.set('challenges')">Challenges</button>
        <button [class.active]="activeTab() === 'sustainability'" (click)="activeTab.set('sustainability')">Sustainability</button>
      </div>

      <!-- Overview Section -->
      <section class="analytics-section" *ngIf="activeTab() === 'overview'">
        <h2 class="section-title">Platform Overview</h2>
        
        <div class="loading-state" *ngIf="overview().loading">
          <div class="spinner"></div><p>Loading Overview...</p>
        </div>
        <div class="error-banner" *ngIf="overview().error">
          Failed to load overview data. <button (click)="loadOverview()">Retry</button>
        </div>

        <div class="stats-row" *ngIf="overview().data as data" >
          <div class="stat-card">
            <span class="material-icons icon-bg-blue">group</span>
            <div class="stat-content">
              <span class="stat-label">Total Users</span>
              <span class="stat-value">{{ data.totalUsers | number }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-indigo">check_circle</span>
            <div class="stat-content">
              <span class="stat-label">Active Users</span>
              <span class="stat-value">{{ data.activeUsers | number }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-yellow">star</span>
            <div class="stat-content">
              <span class="stat-label">Total XP Distributed</span>
              <span class="stat-value">{{ data.totalXp | number }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-blue">military_tech</span>
            <div class="stat-content">
              <span class="stat-label">Badges Awarded</span>
              <span class="stat-value">{{ data.totalBadgesAwarded | number }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-green">flag</span>
            <div class="stat-content">
              <span class="stat-label">Total Challenges</span>
              <span class="stat-value">{{ data.totalChallenges | number }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="material-icons icon-bg-emerald">eco</span>
            <div class="stat-content">
              <span class="stat-label">Total Carbon Tracked</span>
              <span class="stat-value">{{ data.totalCarbonImpact | number:'1.0-2' }} kg</span>
            </div>
          </div>
        </div>
      </section>

      <!-- User Analytics Section -->
      <section class="analytics-section" *ngIf="activeTab() === 'users'">
        <h2 class="section-title">User Analytics</h2>

        <div class="loading-state" *ngIf="users().loading">
          <div class="spinner"></div><p>Loading User Analytics...</p>
        </div>
        <div class="error-banner" *ngIf="users().error">
          Failed to load user analytics. <button (click)="loadUsers()">Retry</button>
        </div>

        <ng-container *ngIf="users().data as data">
          <div class="stats-row" >
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Total Users</span>
                <span class="stat-value">{{ data.totalUsers | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">New Users (Period)</span>
                <span class="stat-value">{{ data.newUsersInPeriod | number }}</span>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card chart-wide">
              <h3>Registration Trend</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="userTrendData()" [options]="lineChartOptions" [type]="'line'"></canvas>
              </div>
            </div>
          </div>
          <div class="charts-row">
            <div class="chart-card">
              <h3>Status Distribution</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="userStatusData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Role Distribution</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="userRoleData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- Gamification Section -->
      <section class="analytics-section" *ngIf="activeTab() === 'gamification'">
        <h2 class="section-title">Gamification Analytics</h2>
        
        <div class="loading-state" *ngIf="gamification().loading">
          <div class="spinner"></div><p>Loading Gamification Analytics...</p>
        </div>
        <div class="error-banner" *ngIf="gamification().error">
          Failed to load gamification analytics. <button (click)="loadGamification()">Retry</button>
        </div>

        <ng-container *ngIf="gamification().data as data">
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Platform XP</span>
                <span class="stat-value">{{ data.totalPlatformXp | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">XP Awarded (Period)</span>
                <span class="stat-value">{{ data.xpAwardedInPeriod | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Avg Eco Score</span>
                <span class="stat-value">{{ data.averageEcoScore | number:'1.0-1' }}</span>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card chart-wide">
              <h3>XP Earned Trend</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="xpTrendData()" [options]="lineChartOptions" [type]="'line'"></canvas>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <h3>XP Sources</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="xpSourceData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Level Distribution</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="levelDistData()" [options]="barChartOptions" [type]="'bar'"></canvas>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- Badge Analytics -->
      <section class="analytics-section" *ngIf="activeTab() === 'badges'">
        <h2 class="section-title">Badge Analytics</h2>

        <div class="loading-state" *ngIf="badges().loading">
          <div class="spinner"></div><p>Loading Badge Analytics...</p>
        </div>
        <div class="error-banner" *ngIf="badges().error">
          Failed to load badge analytics. <button (click)="loadBadges()">Retry</button>
        </div>

        <ng-container *ngIf="badges().data as data">
          <div class="stats-row" >
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Total Badges Awarded</span>
                <span class="stat-value">{{ data.totalBadgesAwarded | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Badges Awarded (Period)</span>
                <span class="stat-value">{{ data.badgesAwardedInPeriod | number }}</span>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <h3>Most Awarded Badges</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="mostAwardedBadgesData()" [options]="integerBarChartOptions" [type]="'bar'"></canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Badge Types</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="badgeTypeData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- Challenge Analytics -->
      <section class="analytics-section" *ngIf="activeTab() === 'challenges'">
        <h2 class="section-title">Challenge Analytics</h2>

        <div class="loading-state" *ngIf="challenges().loading">
          <div class="spinner"></div><p>Loading Challenge Analytics...</p>
        </div>
        <div class="error-banner" *ngIf="challenges().error">
          Failed to load challenge analytics. <button (click)="loadChallenges()">Retry</button>
        </div>

        <ng-container *ngIf="challenges().data as data">
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Total Challenges</span>
                <span class="stat-value">{{ data.totalChallenges | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Active Challenges</span>
                <span class="stat-value">{{ data.activeChallenges | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">Completed Challenges</span>
                <span class="stat-value">{{ data.completedChallenges | number }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-content">
                <span class="stat-label">XP Distributed (Period)</span>
                <span class="stat-value">{{ data.xpDistributedInPeriod | number }}</span>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <h3>Status Distribution</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="challengeStatusData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
            <div class="chart-card">
              <h3>Progress Metric Distribution</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="challengeMetricData()" [options]="donutChartOptions" [type]="'doughnut'"></canvas>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- Sustainability Analytics -->
      <section class="analytics-section" *ngIf="activeTab() === 'sustainability'">
        <h2 class="section-title">Sustainability Analytics</h2>

        <div class="loading-state" *ngIf="sustainability().loading">
          <div class="spinner"></div><p>Loading Sustainability Analytics...</p>
        </div>
        <div class="error-banner" *ngIf="sustainability().error">
          Failed to load sustainability analytics. <button (click)="loadSustainability()">Retry</button>
        </div>

        <ng-container *ngIf="sustainability().data as data">
          <div class="stats-row" >
            <div class="stat-card">
              <span class="material-icons icon-bg-emerald">eco</span>
              <div class="stat-content">
                <span class="stat-label">Total Tracked Emissions</span>
                <span class="stat-value">{{ data.totalCarbonImpact | number:'1.0-2' }} kg CO₂e</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="material-icons icon-bg-green">trending_up</span>
              <div class="stat-content">
                <span class="stat-label">Tracked Emissions (Period)</span>
                <span class="stat-value">{{ data.carbonImpactInPeriod | number:'1.0-2' }} kg CO₂e</span>
              </div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card chart-wide">
              <h3>Emissions Trend</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="carbonTrendData()" [options]="lineChartOptions" [type]="'line'"></canvas>
              </div>
            </div>
          </div>
          <div class="charts-row">
            <div class="chart-card chart-wide">
              <h3>Impact by Category</h3>
              <div class="chart-wrapper">
                <canvas baseChart [data]="carbonCategoryData()" [options]="barChartOptions" [type]="'bar'"></canvas>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: transparent;
      min-height: calc(100vh - 80px);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .analytics-container { padding: 1.5rem 2rem; max-width: 1440px; margin: 0 auto; color: var(--text-primary); }
    
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .title-section h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.03em; color: var(--text-primary); }
    .subtitle { color: var(--text-muted); margin: 0; font-size: 1rem; max-width: 600px; line-height: 1.5; }
    
    .actions-section { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    
    .form-control { width: auto; min-width: 150px; height: 42px; padding: 0 2.5rem 0 1rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; font-weight: 500; background: var(--bg-surface); cursor: pointer; color: var(--text-primary); transition: all 0.2s; outline: none !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05); -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 0.65rem auto; box-sizing: border-box; display: flex; align-items: center; }
    .form-control:focus, .dropdown-header.active { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important; outline: none !important; }
    
    .custom-dropdown { position: relative; display: inline-block; outline: none; }
    .dropdown-header { user-select: none; }
    .dropdown-options { position: absolute; top: calc(100% + 4px); right: 0; min-width: 100%; background: var(--bg-surface); border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); z-index: 50; overflow: hidden; padding: 0.375rem; animation: dropFadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
    .dropdown-option { padding: 0.5rem 1rem; font-size: 0.875rem; color: var(--text-secondary); cursor: pointer; border-radius: 6px; transition: background 0.15s, color 0.15s; font-weight: 500; white-space: nowrap; }
    .dropdown-option:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
    .dropdown-option.selected { background: rgba(59,130,246,0.12); color: #2563eb; font-weight: 600; }
    @keyframes dropFadeIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

    
    .btn { height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; box-shadow: 0 1px 2px rgba(0,0,0,0.05); white-space: nowrap; box-sizing: border-box; }
    .btn .material-icons { font-size: 1.25rem; }
    .btn-outline { background: var(--bg-surface); border-color: var(--border-color); color: var(--text-secondary); }
    .btn-outline:hover:not(:disabled) { background: var(--bg-surface-hover); border-color: var(--text-muted); color: var(--text-primary); transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .tabs-container { display: flex; gap: 0.5rem; margin: 0 auto 2.5rem auto; background: var(--bg-surface-hover); padding: 0.375rem; border-radius: 10px; width: fit-content; overflow-x: auto; max-width: 100%; }
    .tabs-container button { background: transparent; border: none; padding: 0.625rem 1.25rem; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 8px; transition: all 0.2s ease; white-space: nowrap; }
    .tabs-container button:hover:not(.active) { color: var(--text-primary); background: rgba(255,255,255,0.5); }
    .tabs-container button.active { color: var(--text-primary); background: var(--bg-surface); box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }

    .analytics-section { margin-bottom: 2.5rem; animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    
    .section-title { display: none; }

    .stats-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { flex: 1 1 160px; max-width: 200px; background: var(--bg-surface); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid rgba(241,245,249,0.8); transition: transform 0.3s ease, box-shadow 0.3s ease; position: relative; overflow: hidden; align-items: center; text-align: center; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08), 0 8px 10px -5px rgba(0,0,0,0.04); border-color: var(--border-color); }
    
    .stat-card .material-icons { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; margin: 0 auto; }
    
    .icon-bg-blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .icon-bg-indigo { background: rgba(99,102,241,0.12); color: #6366f1; }
    .icon-bg-green { background: rgba(34,197,94,0.12); color: #22c55e; }
    .icon-bg-yellow { background: rgba(234,179,8,0.12); color: #eab308; }
    .icon-bg-emerald { background: rgba(16,185,129,0.12); color: #10b981; }
    
    .stat-content { display: flex; flex-direction: column; width: 100%; align-items: center; justify-content: center; }
    .stat-label { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; line-height: 1.2; }
    .stat-value { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -0.03em; }
    
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .charts-row .chart-wide { grid-column: span 2; }
    
    .chart-card { background: var(--bg-surface); border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid rgba(241,245,249,0.8); transition: box-shadow 0.3s ease; }
    .chart-card:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04); }
    .chart-card h3 { margin: 0 0 1.25rem 0; font-size: 1.125rem; font-weight: 700; color: var(--text-primary); }
    .chart-wrapper { position: relative; height: 320px; width: 100%; display: flex; justify-content: center; }
    
    .error-banner { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem 1.25rem; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border: 1px solid #fecaca; font-weight: 500; font-size: 0.95rem; }
    .error-banner button { background: var(--bg-surface); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 0.4rem 0.75rem; cursor: pointer; color: #991b1b; font-weight: 600; transition: background 0.2s; font-size: 0.875rem; }
    .error-banner button:hover { background: #fee2e2; }
    
    .loading-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); background: transparent; margin-bottom: 1.5rem; }
    .spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid var(--border-color); border-radius: 50%; border-top-color: #3b82f6; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .charts-row { grid-template-columns: 1fr; }
      .charts-row .chart-wide { grid-column: span 1; }
    }
    
    @media (max-width: 768px) {
      .admin-analytics-container { padding: 1rem; }
      .header-section { flex-direction: column; align-items: flex-start; }
      .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        .stat-card { max-width: 100%; flex: none; }
      .stat-card { padding: 1rem; }
      .stat-value { font-size: 1.5rem; }
      .chart-card { padding: 1rem; max-width: 100%; overflow: hidden; }
      .chart-wrapper { height: 250px; }
      .tabs-container { margin-bottom: 1.5rem; width: 100%; justify-content: flex-start; -webkit-overflow-scrolling: touch; }
      .tabs-container button { padding: 0.5rem 1rem; font-size: 0.85rem; }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AdminAnalyticsService);
  private destroyRef = inject(DestroyRef);
  
  dateRange = signal<string>('30');
  activeTab = signal<string>('overview');
  isDropdownOpen = signal<boolean>(false);
  isExportDropdownOpen = signal<boolean>(false);
  
  overview = signal<SectionState<AdminOverviewAnalyticsDTO>>({ data: null, loading: true, error: false });
  users = signal<SectionState<AdminUserAnalyticsDTO>>({ data: null, loading: true, error: false });
  gamification = signal<SectionState<AdminGamificationAnalyticsDTO>>({ data: null, loading: true, error: false });
  badges = signal<SectionState<AdminBadgeAnalyticsDTO>>({ data: null, loading: true, error: false });
  challenges = signal<SectionState<AdminChallengeAnalyticsDTO>>({ data: null, loading: true, error: false });
  sustainability = signal<SectionState<AdminSustainabilityAnalyticsDTO>>({ data: null, loading: true, error: false });

  // Chart Options
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' } }, x: { grid: { display: false } } }
  };
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      } 
    }
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };
  integerBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { 
        beginAtZero: true, 
        ticks: { precision: 0, stepSize: 1 } 
      } 
    }
  };

  private chartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1'];

  // User Charts
  userTrendData = computed<ChartData<'line'>>(() => this.buildTrendChart(this.users().data?.registrationTrend, 'Registrations', '#2563eb'));
  userStatusData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.users().data?.statusDistribution));
  userRoleData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.users().data?.roleDistribution));

  // Gamification Charts
  xpTrendData = computed<ChartData<'line'>>(() => this.buildTrendChart(this.gamification().data?.xpEarnedTrend, 'XP Earned', '#f59e0b'));
  xpSourceData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.gamification().data?.xpSourceDistribution));
  levelDistData = computed<ChartData<'bar'>>(() => this.buildBarChart(this.gamification().data?.levelDistribution, 'Users per Level', '#8b5cf6'));

  // Badge Charts
  mostAwardedBadgesData = computed<ChartData<'bar'>>(() => this.buildBarChart(this.badges().data?.mostAwardedBadges, 'Awards', '#ec4899'));
  badgeTypeData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.badges().data?.badgeTypeDistribution));

  // Challenge Charts
  challengeStatusData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.challenges().data?.statusDistribution));
  challengeMetricData = computed<ChartData<'doughnut'>>(() => this.buildDonutChart(this.challenges().data?.metricDistribution));

  // Sustainability Charts
  carbonTrendData = computed<ChartData<'line'>>(() => this.buildTrendChart(this.sustainability().data?.carbonTrend, 'Emissions (kg)', '#10b981'));
  carbonCategoryData = computed<ChartData<'bar'>>(() => this.buildBarChart(this.sustainability().data?.impactByCategory, 'Emissions (kg)', '#14b8a6'));

  isExporting = signal<boolean>(false);

  ngOnInit() {
    this.loadAllData();
  }

  onDateRangeChange(range: string) {
    this.dateRange.set(range);
    this.loadAllData();
  }

  doExport(format: 'pdf' | 'excel' | 'csv') {
    this.isExportDropdownOpen.set(false);
    this.export(format);
  }

  selectDateRange(range: string) {
    this.dateRange.set(range);
    this.isDropdownOpen.set(false);
    this.loadAllData();
  }

  getDropdownLabel(val: string): string {
    const labels: Record<string, string> = {
      'all': 'All Time',
      '7': 'Last 7 Days',
      '30': 'Last 30 Days',
      '90': 'Last 90 Days',
      '365': 'This Year'
    };
    return labels[val] || 'Last 30 Days';
  }

  getFilter(): AdminAnalyticsFilter {
    const range = this.dateRange();
    if (range === 'all') return {};
    const d = new Date();
    d.setDate(d.getDate() - parseInt(range, 10));
    return { startDate: d.toISOString() }; 
  }

  export(format: 'pdf' | 'excel' | 'csv') {
    if (this.isExporting()) return;
    this.isExporting.set(true);

    const filter = this.getFilter();
    let url = `/api/admin/analytics/export/${format}`;
    if (filter.startDate) {
      url += `?startDate=${encodeURIComponent(filter.startDate)}`;
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    // For proper auth headers in a real app, this might need an HttpClient call that returns a Blob, 
    // but a direct link works if auth is cookie-based. Since we use JWT, we need HttpClient.
    this.analyticsService.downloadExport(format, filter).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        alert('Export failed. Please try again.');
        this.isExporting.set(false);
        return of(null);
      })
    ).subscribe(blob => {
      if (blob) {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        const ext = format === 'excel' ? 'xlsx' : (format === 'csv' ? 'zip' : format);
        link.download = `ecotrack-admin-analytics-${new Date().toISOString().split('T')[0]}.${ext}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
      this.isExporting.set(false);
    });
  }

  loadAllData() {
    this.loadOverview();
    this.loadUsers();
    this.loadGamification();
    this.loadBadges();
    this.loadChallenges();
    this.loadSustainability();
  }

  loadOverview() {
    this.overview.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getOverview(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.overview.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.overview.set({ data, loading: false, error: false }); });
  }

  loadUsers() {
    this.users.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getUserAnalytics(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.users.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.users.set({ data, loading: false, error: false }); });
  }

  loadGamification() {
    this.gamification.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getGamificationAnalytics(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.gamification.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.gamification.set({ data, loading: false, error: false }); });
  }

  loadBadges() {
    this.badges.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getBadgeAnalytics(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.badges.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.badges.set({ data, loading: false, error: false }); });
  }

  loadChallenges() {
    this.challenges.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getChallengeAnalytics(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.challenges.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.challenges.set({ data, loading: false, error: false }); });
  }

  loadSustainability() {
    this.sustainability.update(s => ({ ...s, loading: true, error: false }));
    this.analyticsService.getSustainabilityAnalytics(this.getFilter()).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => { this.sustainability.update(s => ({ ...s, error: true, loading: false })); return of(null); })
    ).subscribe(data => { if (data) this.sustainability.set({ data, loading: false, error: false }); });
  }

  private buildTrendChart(trend: AnalyticsTrendPointDTO[] | undefined, label: string, color: string): ChartData<'line'> {
    if (!trend || trend.length === 0) return { labels: [], datasets: [] };
    return {
      labels: trend.map(t => t.label),
      datasets: [{
        label,
        data: trend.map(t => t.value),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4
      }]
    };
  }

  private formatLabel(str: string): string {
    if (!str) return '';
    return str.replace(/_/g, ' ')
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
  }

  private buildDonutChart(dist: AnalyticsDistributionDTO[] | undefined): ChartData<'doughnut'> {
    if (!dist || dist.length === 0) return { labels: [], datasets: [] };
    return {
      labels: dist.map(d => this.formatLabel(d.category)),
      datasets: [{
        data: dist.map(d => d.value),
        backgroundColor: this.chartColors.slice(0, dist.length),
        borderWidth: 0
      }]
    };
  }

  private buildBarChart(dist: AnalyticsDistributionDTO[] | undefined, label: string, color: string): ChartData<'bar'> {
    if (!dist || dist.length === 0) return { labels: [], datasets: [] };
    return {
      labels: dist.map(d => this.formatLabel(d.category)),
      datasets: [{
        label,
        data: dist.map(d => d.value),
        backgroundColor: color,
        borderRadius: 4
      }]
    };
  }
}



