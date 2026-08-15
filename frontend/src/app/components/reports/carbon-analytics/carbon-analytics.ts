import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { CarbonAnalyticsDTO, CarbonEntryPageDTO } from '../../../models/report.models';
import { LucideAngularModule, Cloud, Leaf, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, CircleAlert, ChartNoAxesColumn, CloudOff, Info } from 'lucide-angular';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-carbon-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  providers: [DecimalPipe, provideCharts(withDefaultRegisterables())],
  templateUrl: './carbon-analytics.html'
})
export class CarbonAnalytics implements OnChanges {
  ChartNoAxesColumnIcon = ChartNoAxesColumn;
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  CloudIcon = Cloud;
  LeafIcon = Leaf;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  MinusIcon = Minus;
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  CircleAlertIcon = CircleAlert;
  BarChartIcon = ChartNoAxesColumn;
  CloudOffIcon = CloudOff;
  InfoIcon = Info;

  analyticsData = signal<CarbonAnalyticsDTO | null>(null);
  entriesData = signal<CarbonEntryPageDTO | null>(null);

  isLoadingAnalytics = signal(false);
  isLoadingEntries = signal(false);
  analyticsError = signal('');
  entriesError = signal('');

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
          label: (context) => `${context.parsed.y} kg CO₂e`
        }
      }
    }
  };
  public trendChartType: 'line' = 'line';
  public trendChartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });

  public categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed} kg CO₂e`
        }
      }
    },
    cutout: '70%'
  };
  public categoryChartType: 'doughnut' = 'doughnut';
  public categoryChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  public categoryChartColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280'];

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.currentPage.set(0); // Reset page on date change
      this.loadAnalytics();
      this.loadEntries();
    }
  }

  loadAnalytics(): void {
    if (!this.startDate || !this.endDate) return;
    
    this.isLoadingAnalytics.set(true);
    this.analyticsError.set('');
    
    this.reportService.getCarbonAnalytics(this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoadingAnalytics.set(false)))
      .subscribe({
      next: (data: CarbonAnalyticsDTO) => {
        this.analyticsData.set(data);
        this.updateTrendChart();
        this.updateCategoryChart();
      },
      error: (err: any) => {
        console.error('Error fetching carbon analytics', err);
        this.analyticsError.set('We couldn\'t retrieve your carbon analytics data.');
      }
    });
  }

  loadEntries(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoadingEntries.set(true);
    this.entriesError.set('');

    this.reportService.getCarbonEntries(this.startDate, this.endDate, this.currentPage(), this.pageSize)
      .pipe(finalize(() => this.isLoadingEntries.set(false)))
      .subscribe({
      next: (data: CarbonEntryPageDTO) => {
        this.entriesData.set(data);
      },
      error: (err: any) => {
        console.error('Error fetching carbon entries', err);
        this.entriesError.set('We couldn\'t retrieve your recent entries.');
      }
    });
  }

  updateTrendChart(): void {
    const data = this.analyticsData();
    if (!data || !data.trend || data.trend.length === 0) {
      this.trendChartData.set({ labels: [], datasets: [] });
      return;
    }

    this.trendChartData.set({
      labels: data.trend.map(t => this.formatTrendDate(t.date)),
      datasets: [{
        data: data.trend.map(t => t.emission),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#10b981'
      }]
    });
  }

  updateCategoryChart(): void {
    const data = this.analyticsData();
    if (!data || !data.categoryRankings || data.categoryRankings.length === 0) {
      this.categoryChartData.set({ labels: [], datasets: [] });
      return;
    }

    const labels = data.categoryRankings.map(c => c.category);
    const emissionsData = data.categoryRankings.map(c => c.absoluteEmissions);

    this.categoryChartData.set({
      labels: labels,
      datasets: [{
        data: emissionsData,
        backgroundColor: this.categoryChartColors.slice(0, labels.length)
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

  getCategoryColor(index: number): string {
    return this.categoryChartColors[index % this.categoryChartColors.length];
  }

  onPageChange(page: number): void {
    const data = this.entriesData();
    if (page >= 0 && (!data || page < data.totalPages)) {
      this.currentPage.set(page);
      this.loadEntries();
    }
  }
}
