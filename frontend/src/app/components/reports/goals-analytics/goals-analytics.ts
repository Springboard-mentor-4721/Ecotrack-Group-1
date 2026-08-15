import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { GoalAnalyticsDTO, GoalPerformancePageDTO } from '../../../models/report.models';
import { LucideAngularModule, Target, CircleCheckBig, CircleAlert, ChartNoAxesColumn, Flag, TriangleAlert, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Activity, Clock, ShieldAlert } from 'lucide-angular';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-goals-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  providers: [DecimalPipe, provideCharts(withDefaultRegisterables())],
  templateUrl: './goals-analytics.html'
})
export class GoalsAnalytics implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  TargetIcon = Target;
  CircleCheckBigIcon = CircleCheckBig;
  CircleAlertIcon = CircleAlert;
  ChartNoAxesColumnIcon = ChartNoAxesColumn;
  FlagIcon = Flag;
  TriangleAlertIcon = TriangleAlert;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  MinusIcon = Minus;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  ActivityIcon = Activity;
  ClockIcon = Clock;
  ShieldAlertIcon = ShieldAlert;

  analyticsData = signal<GoalAnalyticsDTO | null>(null);
  performanceData = signal<GoalPerformancePageDTO | null>(null);

  isLoadingAnalytics = signal(false);
  isLoadingPerformance = signal(false);
  analyticsError = signal('');
  performanceError = signal('');

  currentPage = signal(0);
  pageSize = 10;
  
  Math = Math;

  // Chart configuration
  public trendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} Progress`
        }
      }
    }
  };
  public trendChartType: 'line' = 'line';
  public trendChartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });

  public statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '70%'
  };
  public statusChartType: 'doughnut' = 'doughnut';
  public statusChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  
  public statusColors: { [key: string]: string } = {
    'ACTIVE': '#3b82f6', // blue
    'ACHIEVED': '#10b981', // green
    'EXPIRED': '#ef4444', // red
    'ABANDONED': '#6b7280' // gray
  };

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.currentPage.set(0); // Reset page on date change
      this.loadAnalytics();
      this.loadPerformance();
    }
  }

  loadAnalytics(): void {
    if (!this.startDate || !this.endDate) return;
    
    this.isLoadingAnalytics.set(true);
    this.analyticsError.set('');
    
    this.reportService.getGoalAnalytics(this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoadingAnalytics.set(false)))
      .subscribe({
      next: (data: GoalAnalyticsDTO) => {
        this.analyticsData.set(data);
        this.updateTrendChart();
        this.updateStatusChart();
      },
      error: (err: any) => {
        console.error('Error fetching goal analytics', err);
        this.analyticsError.set('We couldn\'t retrieve your goal analytics data.');
      }
    });
  }

  loadPerformance(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoadingPerformance.set(true);
    this.performanceError.set('');

    this.reportService.getGoalPerformance(this.startDate, this.endDate, this.currentPage(), this.pageSize)
      .pipe(finalize(() => this.isLoadingPerformance.set(false)))
      .subscribe({
      next: (data: GoalPerformancePageDTO) => {
        this.performanceData.set(data);
      },
      error: (err: any) => {
        console.error('Error fetching goal performance', err);
        this.performanceError.set('We couldn\'t retrieve your goal performance list.');
      }
    });
  }

  updateTrendChart(): void {
    const data = this.analyticsData();
    if (!data || !data.progressTrend || data.progressTrend.length === 0) {
      this.trendChartData.set({ labels: [], datasets: [] });
      return;
    }

    this.trendChartData.set({
      labels: data.progressTrend.map(t => this.formatTrendDate(t.date)),
      datasets: [{
        data: data.progressTrend.map(t => t.progressValue),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6'
      }]
    });
  }

  updateStatusChart(): void {
    const data = this.analyticsData();
    if (!data || !data.statusDistribution) {
      this.statusChartData.set({ labels: [], datasets: [] });
      return;
    }

    const statuses = Object.keys(data.statusDistribution);
    const amounts = Object.values(data.statusDistribution);
    const colors = statuses.map(s => this.statusColors[s] || '#cbd5e1');

    this.statusChartData.set({
      labels: statuses,
      datasets: [{
        data: amounts,
        backgroundColor: colors
      }]
    });
  }

  formatTrendDate(dateStr: string): string {
    if (dateStr.length === 7) {
      const parts = dateStr.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } else if (dateStr.length === 10) {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return dateStr;
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#cbd5e1';
  }

  onPageChange(page: number): void {
    const data = this.performanceData();
    if (page >= 0 && (!data || page < data.totalPages)) {
      this.currentPage.set(page);
      this.loadPerformance();
    }
  }
}
