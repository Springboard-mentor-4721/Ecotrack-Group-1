import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ProfileService } from '../../services/profile.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardResponse } from '../../models/admin.models';
import { DashboardService } from '../../services/dashboard.service';
import { 
  DashboardSummaryDTO, 
  RecentActivityDTO, 
  GoalResponse,
  ChallengeParticipantDTO,
  BadgeDTO
} from '../../models/dashboard.models';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

import { RecentAchievementsComponent } from './widgets/recent-achievements/recent-achievements.component';
import { EcoTipCardComponent } from './widgets/eco-tip-card/eco-tip-card.component';
import { UnifiedInsightsPanelComponent } from './widgets/unified-insights-panel/unified-insights-panel.component';
import { AiFeatureState } from '../../models/ai-feature-state.model';
import { EcoTipResponse } from '../../models/ai-models';
import { EcoScoreColorPipe } from '../../shared/pipes/eco-score-color.pipe';
import { 
  LucideAngularModule, 
  Sparkles, 
  Layers, 
  Flame, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSkeletonComponent, 
    BaseChartDirective,
    EcoTipCardComponent,
    UnifiedInsightsPanelComponent,
    RecentAchievementsComponent,
    EcoScoreColorPipe,
    LucideAngularModule
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  Math = Math;

  // Icons
  readonly SparklesIcon = Sparkles;
  readonly LayersIcon = Layers;
  readonly TrendingUpIcon = TrendingUp;
  readonly FlameIcon = Flame;
  readonly TrophyIcon = Trophy;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Activity;

  // Core State
  isLoading = true;
  apiError = false;
  isAdmin = false;
  
  // Data
  user: any = null;
  dashboardSummary: DashboardSummaryDTO | null = null;
  adminStats: AdminDashboardResponse | null = null;
  
  // AI Feature States
  ecoTipState: AiFeatureState<EcoTipResponse> = { loading: false, data: null, error: null, empty: true };
  
  // Storytelling Elements
  greeting = 'Good Day';
  today = new Date();
  heroInsight: string = '';
  
  // Custom Data Structures for UI
  carbonSources: { name: string, percentage: number, value: number, color: string }[] = [];
  emissionsChangePercent: number | null = null;

  // Charts
  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, right: 10, bottom: 10, left: -5 } },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { display: false, drawTicks: false },
        border: { display: false },
        ticks: { display: false }
      },
      x: { 
        grid: { display: false, drawTicks: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, padding: 12 }
      }
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    }
  };
  public lineChartType: ChartType = 'line';

  public doughnutChartData: ChartData<'doughnut'> = { datasets: [] };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] | any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    layout: { padding: 10 },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    }
  };
  public doughnutChartType: ChartType = 'doughnut';

  constructor(
    private profileService: ProfileService,
    private dashboardService: DashboardService,
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.isAdmin = payload.role === 'ADMIN';
      } catch (e) {}
    }

    this.initStorytellingElements();
    this.loadDashboardData();
  }

  private initStorytellingElements(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 18) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.apiError = false;

    forkJoin({
      profile: this.profileService.getMyProfile().pipe(catchError(() => of(null))),
      dashboard: this.dashboardService.getDashboardSummary().pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
        // Force chart update after change detection
        setTimeout(() => {
          if (this.charts) {
            this.charts.forEach(c => c.chart?.update());
          }
        });
      })
    ).subscribe({
      next: (results) => {
        if (results.profile) {
          this.user = results.profile;
        }
        
        if (results.dashboard) {
          this.dashboardSummary = results.dashboard;
          this.processCarbonSources(this.dashboardSummary?.categoryBreakdown);
          this.updateCharts(this.dashboardSummary?.monthlyTrend);
          this.calculateEmissionsChange();
        } else {
          this.apiError = true;
        }

        if (this.isAdmin) {
          this.loadAdminStats();
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.apiError = true;
      }
    });

    this.loadAiFeatures();
  }

  private loadAiFeatures(): void {
    // 1. Eco Tip
    this.ecoTipState = { loading: true, data: null, error: null, empty: true };
    this.dashboardService.getEcoTip().subscribe({
      next: (res) => this.ecoTipState = { loading: false, data: res, error: null, empty: false },
      error: (err) => this.ecoTipState = { loading: false, data: null, error: 'Failed to generate daily tip', empty: true }
    });
  }

  private calculateEmissionsChange(): void {
    const current = this.dashboardSummary?.userSummary.monthlyEmission || 0;
    const previous = this.dashboardSummary?.userSummary.previousMonthEmission || 0;
    
    if (previous === 0) {
      this.emissionsChangePercent = null;
    } else {
      this.emissionsChangePercent = ((current - previous) / previous) * 100;
    }

    this.generateHeroInsight();
  }

  private generateHeroInsight(): void {
    if (this.emissionsChangePercent !== null && this.emissionsChangePercent < 0) {
      this.heroInsight = `Great job! Your emissions are down ${Math.abs(this.emissionsChangePercent).toFixed(1)}% this month.`;
    } else if (this.dashboardSummary?.gamificationProfile.currentStreak && this.dashboardSummary.gamificationProfile.currentStreak >= 3) {
      this.heroInsight = `You're on a ${this.dashboardSummary.gamificationProfile.currentStreak}-day sustainability streak. Keep it up!`;
    } else {
      this.heroInsight = 'Ready to make a positive impact today?';
    }
  }

  private processCarbonSources(categorySummaries: any[] | undefined): void {
    if (!categorySummaries || categorySummaries.length === 0) return;
    
    const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#94a3b8', '#f59e0b'];
    
    this.carbonSources = categorySummaries
      .map((s, i) => ({
        name: s.categoryName,
        value: s.emission,
        percentage: s.percentage,
        color: colors[i % colors.length]
      }))
      .sort((a,b) => b.percentage - a.percentage);
      
    // Update doughnut chart
    this.doughnutChartData = {
      labels: this.carbonSources.map(s => s.name),
      datasets: [{
        data: this.carbonSources.map(s => s.value),
        backgroundColor: this.carbonSources.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }

  private updateCharts(monthlyTrend: any): void {
    if (!monthlyTrend || monthlyTrend.length === 0) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }
    
    const labels = monthlyTrend.map((d: any) => d.month);
    const data = monthlyTrend.map((d: any) => d.emission);

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Emissions (kg)',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  private loadAdminStats(): void {
    this.adminService.getDashboardSummary()
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (stats: any) => this.adminStats = stats
      });
  }

  get trendInsight(): string {
    if (!this.dashboardSummary?.monthlyTrend || this.dashboardSummary.monthlyTrend.length < 2) return 'Last 6 Months';
    const len = this.dashboardSummary.monthlyTrend.length;
    const last = this.dashboardSummary.monthlyTrend[len - 1].emission;
    const prev = this.dashboardSummary.monthlyTrend[len - 2].emission;
    if (last > prev) return 'Emissions increased this month.';
    if (last < prev) return 'Your emissions are trending downward.';
    return 'Last 6 Months';
  }

  get topSourceInsight(): string {
    if (this.carbonSources.length > 0) {
      const top = this.carbonSources[0];
      return `Top source: ${top.name} \u00B7 ${top.percentage.toFixed(0)}%`;
    }
    return 'Last 30 Days';
  }

  getMetricUnit(metric: string | undefined): string {
    if (!metric) return '';
    switch (metric) {
      case 'ENTRY_COUNT': return 'entries';
      case 'QUANTITY': return 'kg';
      case 'CARBON_EMISSION': return 'kgCO2e';
      default: return '';
    }
  }
}
