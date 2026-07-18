import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
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
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Load Profile, Summary, and Recent Entries concurrently
    forkJoin({
      profile: this.profileService.getMyProfile().pipe(catchError(() => of(null))),
      summary: this.carbonEntryService.getDashboardSummary(startDateStr, endDateStr).pipe(catchError(() => of(null))),
      entries: this.carbonEntryService.getEntries(0, 50).pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
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
        }
        
        if (results.entries) {
          this.recentEntries = results.entries.content || [];
          this.totalEntries = results.entries.totalElements || 0;
          this.processTimeline();
          this.processWeeklyJourney();
          this.updateCharts(results.entries.content || []);
        }

        this.calculateEcoScore();

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
    // Backend does not provide Eco Score
    this.ecoScore = null;
  }

  private calculateProfileCompletion(profile: any): number | null {
    // Backend does not provide profile completion percentage natively
    return null;
  }

  private updateCharts(entries: CarbonEntryResponse[]): void {
    // Backend does not provide a time-series daily emission endpoint.
    // Frontend aggregation is strictly prohibited by project requirements.
    this.lineChartData = {
      labels: [],
      datasets: []
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
