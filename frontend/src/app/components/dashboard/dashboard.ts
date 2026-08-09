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
import { GamificationService } from '../../services/gamification.service';
import { DashboardResponse, RecentActivityDTO } from '../../models/dashboard.models';
import { GamificationProfile, Badge } from '../../models/gamification.models';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

import { EcoScoreCardComponent } from './widgets/eco-score-card/eco-score-card.component';
import { XpLevelBarComponent } from './widgets/xp-level-bar/xp-level-bar.component';
import { StreakTrackerComponent } from './widgets/streak-tracker/streak-tracker.component';
import { RecentAchievementsComponent } from './widgets/recent-achievements/recent-achievements.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSkeletonComponent, 
    BaseChartDirective,
    EcoScoreCardComponent,
    XpLevelBarComponent,
    StreakTrackerComponent,
    RecentAchievementsComponent
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  // Core State
  isLoading = true;
  isAdmin = false;
  isLeaderboardLoading = false;
  leaderboardError = '';

  weeklyJourney: any[] = []; // Used for placeholder empty state logic
  adminStatsLoading = false;
  gamificationLoading = true;
  
  // Data
  user: any = null;
  profileCompletion: number | null = null;
  totalEmissions = 0; // Current 30 days
  totalEntries = 0;
  recentEntries: RecentActivityDTO[] = [];
  adminStats: AdminDashboardResponse | null = null;
  
  // Gamification Data
  gamificationProfile: GamificationProfile | null = null;
  recentBadges: Badge[] = [];
  
  // Storytelling Elements
  greeting = 'Good Day';
  quote = '';
  today = new Date();
  
  // Custom Data Structures for UI
  ecoScore: number = 0;
  ecoGrade: string = 'N/A';
  streak: number = 0;
  goalsHealth: string = 'Good';
  achievements: number = 0;
  carbonSources: { name: string, percentage: number, value: number, color: string }[] = [];

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
    private gamificationService: GamificationService,
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

    const quotes = [
      "There is no Planet B.",
      "Every sustainable action ripples outward.",
      "The greatest threat to our planet is the belief that someone else will save it.",
      "Small habits transform the world.",
      "Sustainability is a journey, not a destination."
    ];
    this.quote = quotes[Math.floor(Math.random() * quotes.length)];
    
    // Generate Weekly Journey (Last 7 Days)
    this.weeklyJourney = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for(let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      this.weeklyJourney.push({
        day: days[d.getDay()],
        filled: false, // Will calculate after data loads
        today: i === 0
      });
    }
  }

  private loadDashboardData(): void {
    forkJoin({
      profile: this.profileService.getMyProfile().pipe(catchError(() => of(null))),
      dashboard: this.dashboardService.getUserDashboard().pipe(catchError(() => of(null)))
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
          this.profileCompletion = this.calculateProfileCompletion(results.profile);
        }
        
        if (results.dashboard) {
          const dash = results.dashboard;
          this.totalEmissions = dash.userSummary?.monthlyEmission || 0;
          this.totalEntries = dash.userSummary?.totalEntries || 0;
          this.recentEntries = dash.recentActivities || [];
          // Gamification data is now loaded from GamificationService to avoid conflicts
          // this.ecoScore and this.ecoGrade are handled after GamificationProfile loads
          this.processCarbonSources(dash.categoryBreakdown);
          this.updateCharts(dash.monthlyTrend);
          this.processGoals(dash.goalSummary);
        }

        if (this.isAdmin) {
          this.loadAdminStats();
        }
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });

    // Load Gamification separately
    this.gamificationLoading = true;
    forkJoin({
      profile: this.gamificationService.getProfile().pipe(catchError(() => of(null))),
      badges: this.gamificationService.getBadges().pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => {
        this.gamificationLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.profile) {
          this.gamificationProfile = res.profile;
          this.streak = res.profile.currentStreak || 0;
          this.ecoScore = res.profile.currentEcoScore || 0;
          this.ecoGrade = res.profile.currentEcoGrade || 'C';
        }
        if (res.badges) {
          this.recentBadges = res.badges.filter(b => b.isEarned).slice(0, 5);
        }
      }
    });
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

  private processGoals(goalSummary: any): void {
    if (!goalSummary) {
      this.achievements = 0;
      this.goalsHealth = '0';
      return;
    }
    
    this.achievements = goalSummary.completedGoals || 0;
    
    const percentage = goalSummary.completionPercentage || 0;
    
    if (percentage >= 80) this.goalsHealth = 'Excellent';
    else if (percentage >= 50) this.goalsHealth = 'Good';
    else if (percentage >= 20) this.goalsHealth = 'Needs Attention';
    else this.goalsHealth = 'Critical';
  }

  private calculateProfileCompletion(profile: any): number | null {
    if (!profile) return 0;
    const fields = ['name', 'email', 'bio', 'profilePictureUrl', 'location', 'lifestylePreferences'];
    let filled = 0;
    fields.forEach(f => {
      if (profile[f] !== null && profile[f] !== undefined && String(profile[f]).trim() !== '') {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
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
    this.adminStatsLoading = true;
    this.adminService.getDashboardSummary()
      .pipe(finalize(() => {
        this.adminStatsLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (stats: any) => this.adminStats = stats,
        error: (err: any) => console.error('Failed to load admin stats', err)
      });
  }
}
