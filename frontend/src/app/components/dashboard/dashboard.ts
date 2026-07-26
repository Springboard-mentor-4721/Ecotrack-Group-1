import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ProfileService } from '../../services/profile.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardResponse } from '../../models/admin.models';
import { CarbonEntryService } from '../../services/carbon-entry.service';
import { CarbonEntryResponse } from '../../models/carbon.models';
import { forkJoin, of } from 'rxjs';
import { finalize, map, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { GoalService } from '../../services/goal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  // Core State
  isLoading = true;
  isAdmin = false;
  adminStatsLoading = false;
  
  // Data
  user: any = null;
  profileCompletion: number | null = null;
  totalEmissions = 0; // Current 30 days
  totalEntries = 0;
  recentEntries: CarbonEntryResponse[] = [];
  adminStats: AdminDashboardResponse | null = null;
  
  // Storytelling Elements
  greeting = 'Good Day';
  quote = '';
  today = new Date();
  
  // Custom Data Structures for UI
  ecoScore: number | null = null;
  streak: number | null = null;
  goalsHealth: string = 'Good';
  achievements: number = 0;
  weeklyGoal: number | null = null;
  weeklyJourney: { day: string, filled: boolean, today: boolean }[] = [];
  carbonSources: { name: string, percentage: number, value: number, color: string }[] = [];
  
  // Grouped Timeline
  timelineGroups: { name: string, entries: CarbonEntryResponse[] }[] = [];

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
    private carbonEntryService: CarbonEntryService,
    private goalService: GoalService,
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
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    
    // Format to YYYY-MM-DD using local time to prevent timezone bugs
    const startDateStr = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
    const endDateStr = end.getFullYear() + '-' + String(end.getMonth() + 1).padStart(2, '0') + '-' + String(end.getDate()).padStart(2, '0');

    // Load Profile, Summary, and Recent Entries concurrently
    forkJoin({
      profile: this.profileService.getMyProfile().pipe(catchError(() => of(null))),
      summary: this.carbonEntryService.getDashboardSummary(startDateStr, endDateStr).pipe(catchError(() => of(null))),
      entries: this.carbonEntryService.getEntries(0, 50, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'entryDate,desc').pipe(catchError(() => of(null))),
      goals: this.goalService.getGoals(0, 100).pipe(catchError(() => of(null)))
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
        
        if (results.summary) {
          this.totalEmissions = results.summary.totalEmission || 0;
          this.processCarbonSources(results.summary.categorySummaries);
          this.updateCharts(results.summary);
        }
        
        if (results.entries) {
          this.recentEntries = results.entries.content || [];
          this.totalEntries = results.entries.totalElements || 0;
          this.processTimeline();
          this.processWeeklyJourney();
        }
        
        if (results.goals && results.goals.content) {
          this.processGoals(results.goals.content);
        }

        this.calculateEcoScore();
        this.calculateStreakAndGoal();

        if (this.isAdmin) {
          this.loadAdminStats();
        }
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });
  }

  private processCarbonSources(categorySummaries: any[] | undefined): void {
    if (!categorySummaries || categorySummaries.length === 0) return;
    
    const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#94a3b8', '#f59e0b'];
    
    this.carbonSources = categorySummaries
      .map((s, i) => ({
        name: s.categoryName,
        value: s.totalEmission,
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

  private processTimeline(): void {
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: Record<string, CarbonEntryResponse[]> = {
      'TODAY': [],
      'YESTERDAY': [],
      'THIS WEEK': []
    };

    // Take top 10 for journal
    this.recentEntries.slice(0, 10).forEach(entry => {
      const eDate = new Date(entry.entryDate);
      eDate.setHours(0,0,0,0);
      if (eDate.getTime() === today.getTime()) groups['TODAY'].push(entry);
      else if (eDate.getTime() === yesterday.getTime()) groups['YESTERDAY'].push(entry);
      else groups['THIS WEEK'].push(entry);
    });

    this.timelineGroups = [];
    if (groups['TODAY'].length) this.timelineGroups.push({ name: 'TODAY', entries: groups['TODAY'] });
    if (groups['YESTERDAY'].length) this.timelineGroups.push({ name: 'YESTERDAY', entries: groups['YESTERDAY'] });
    if (groups['THIS WEEK'].length) this.timelineGroups.push({ name: 'THIS WEEK', entries: groups['THIS WEEK'] });
  }

  private processWeeklyJourney(): void {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Map entries to days
    const activeDates = new Set(this.recentEntries.map(e => {
      const d = new Date(e.entryDate);
      d.setHours(0,0,0,0);
      return d.getTime();
    }));

    this.weeklyJourney = this.weeklyJourney.map((wj, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0,0,0,0);
      return { ...wj, filled: activeDates.has(d.getTime()) };
    });
  }

  private calculateEcoScore(): void {
    if (this.totalEntries === 0) {
      this.ecoScore = 0;
      return;
    }
    const penalty = Math.min(this.totalEmissions / 20, 40);
    const bonus = Math.min(this.totalEntries * 2, 30);
    this.ecoScore = Math.max(10, Math.min(100, Math.round(70 - penalty + bonus)));
  }

  private getComputedStatus(goal: any): string {
    const s = goal.status as string;
    if (s === 'ABANDONED' || s === 'ARCHIVED') return 'ARCHIVED';
    if (s === 'PAUSED') return 'PAUSED';
    if (s === 'ACHIEVED' || s === 'COMPLETED') return 'COMPLETED';
    if (!goal.isAutomatic) return goal.status;
    const limit = goal.targetValue;
    const current = goal.currentValue;
    if (current >= limit) return 'EXCEEDED';
    if (current >= limit * 0.75) return 'NEAR_LIMIT';
    return 'WITHIN_BUDGET';
  }

  private processGoals(goals: any[]): void {
    if (!goals || goals.length === 0) {
      this.achievements = 0;
      this.goalsHealth = '0';
      return;
    }
    
    // Achievements: non-automatic completed goals
    this.achievements = goals.filter(g => !g.isAutomatic && ((g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED')).length;
    
    // Goals Health: based on automatic budgets
    const autoGoals = goals.filter(g => g.isAutomatic).length;
    if (autoGoals === 0) {
       this.goalsHealth = 'Good';
       return;
    }
    
    const nearLimitGoals = goals.filter(g => g.isAutomatic && this.getComputedStatus(g) === 'NEAR_LIMIT').length;
    const exceededGoals = goals.filter(g => g.isAutomatic && this.getComputedStatus(g) === 'EXCEEDED').length;
    
    const healthy = autoGoals - (nearLimitGoals + exceededGoals);
    const healthRatio = healthy / autoGoals;
    
    if (healthRatio >= 0.8) this.goalsHealth = 'Excellent';
    else if (healthRatio >= 0.5) this.goalsHealth = 'Good';
    else if (healthRatio >= 0.2) this.goalsHealth = 'Needs Attention';
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

  private calculateStreakAndGoal(): void {
    if (!this.recentEntries || this.recentEntries.length === 0) {
      this.streak = 0;
      this.weeklyGoal = 0;
      return;
    }
    
    // Calculate Streak
    const activeDates = new Set(this.recentEntries.map(e => {
      const d = new Date(e.entryDate);
      d.setHours(0,0,0,0);
      return d.getTime();
    }));

    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    // If no entry today, check if there was an entry yesterday
    if (!activeDates.has(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while(activeDates.has(checkDate.getTime())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    this.streak = currentStreak;

    // Calculate Weekly Goal (days active this week out of 7)
    let thisWeekActive = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      if (activeDates.has(d.getTime())) {
        thisWeekActive++;
      }
    }
    this.weeklyGoal = thisWeekActive;
  }

  private updateCharts(summary: any): void {
    if (!summary || !summary.weeklyTrend || summary.weeklyTrend.length === 0) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }
    
    const trend = summary.weeklyTrend;
    const labels = trend.map((d: any) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = trend.map((d: any) => d.totalEmission);

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
