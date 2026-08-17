import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { ChallengeAnalyticsDTO, ChallengePerformancePageDTO } from '../../../models/report.models';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { LucideAngularModule, Trophy, Flame, Target, CircleCheck, ArrowUpRight, ArrowDownRight, Minus, TriangleAlert, ChevronLeft, ChevronRight, CircleDot, Swords, PieChart, XCircle } from 'lucide-angular';
import { finalize } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-challenge-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './challenge-analytics.html'
})
export class ChallengeAnalytics implements OnChanges, AfterViewInit {
  SwordsIcon = Swords;
  PieChartIcon = PieChart;
  XCircleIcon = XCircle;
  CircleDotIcon = CircleDot;
  ChevronRightIcon = ChevronRight;
  ChevronLeftIcon = ChevronLeft;
  TriangleAlertIcon = TriangleAlert;
  MinusIcon = Minus;
  ArrowDownRightIcon = ArrowDownRight;
  ArrowUpRightIcon = ArrowUpRight;
  CircleCheckIcon = CircleCheck;
  TargetIcon = Target;
  FlameIcon = Flame;
  TrophyIcon = Trophy;
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  analyticsData = signal<ChallengeAnalyticsDTO | null>(null);
  performanceData = signal<ChallengePerformancePageDTO | null>(null);

  isLoadingAnalytics = signal(true);
  analyticsError = signal('');

  isLoadingPerformance = signal(true);
  performanceError = signal('');

  currentPage = signal(0);
  pageSize: number = 10;

  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  private trendChartInstance: any | null = null;
  private statusChartInstance: any | null = null;

  readonly Trophy = Trophy;
  readonly Flame = Flame;
  readonly Target = Target;
  readonly CircleCheck = CircleCheck;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;
  readonly Minus = Minus;
  readonly TriangleAlert = TriangleAlert;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly CircleDot = CircleDot;

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.currentPage.set(0); // reset
      this.loadAnalytics();
      this.loadPerformance();
    }
  }

  ngAfterViewInit(): void {
    if (this.analyticsData()) {
      this.updateTrendChart();
      this.updateStatusChart();
    }
  }

  loadAnalytics(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoadingAnalytics.set(true);
    this.analyticsError.set('');
    
    this.reportService.getChallengeAnalytics(this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoadingAnalytics.set(false)))
      .subscribe({
      next: (data: ChallengeAnalyticsDTO) => {
        this.analyticsData.set(data);
        this.updateTrendChart();
        this.updateStatusChart();
      },
      error: (err: any) => {
        console.error('Error fetching challenge analytics', err);
        this.analyticsError.set('We couldn\'t retrieve your challenge analytics data.');
      }
    });
  }

  loadPerformance(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoadingPerformance.set(true);
    this.performanceError.set('');

    this.reportService.getChallengePerformance(this.startDate, this.endDate, this.currentPage(), this.pageSize)
      .pipe(finalize(() => this.isLoadingPerformance.set(false)))
      .subscribe({
      next: (data: ChallengePerformancePageDTO) => {
        this.performanceData.set(data);
      },
      error: (err: any) => {
        console.error('Error fetching challenge performance', err);
        this.performanceError.set('We couldn\'t retrieve your challenge performance list.');
      }
    });
  }

  changePage(newPage: number): void {
    const data = this.performanceData();
    if (data && newPage >= 0 && newPage < data.totalPages) {
      this.currentPage.set(newPage);
      this.loadPerformance();
    }
  }

  private updateTrendChart(): void {
    const data = this.analyticsData();
    if (!this.trendChartRef || !data || !data.completionTrend) return;

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    const labels = data.completionTrend.map(d => d.date);
    const chartData = data.completionTrend.map(d => d.count);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Challenges Completed',
          data: chartData,
          borderColor: '#10b981', // green-500
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: { size: 13, family: "'Inter', sans-serif" },
            bodyFont: { size: 14, family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: {
              color: 'rgba(0, 0, 0, 0.04)'
            },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        }
      }
    };

    this.trendChartInstance = new Chart(ctx, config);
  }

  private updateStatusChart(): void {
    const data = this.analyticsData();
    if (!this.statusChartRef || !data || !data.statusDistribution) return;

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }

    const dist = data.statusDistribution;
    
    // Ordered categories
    const categories = ['ACTIVE', 'COMPLETED', 'FAILED', 'DROPPED'];
    const labels = categories.map(c => c.charAt(0) + c.slice(1).toLowerCase());
    const chartData = categories.map(c => dist[c] || 0);

    const bgColors = [
      '#3b82f6', // blue-500 for Active
      '#10b981', // green-500 for Completed
      '#ef4444', // red-500 for Failed
      '#9ca3af'  // gray-400 for Dropped
    ];

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: chartData,
          backgroundColor: bgColors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                family: "'Inter', sans-serif",
                size: 13
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: { size: 13, family: "'Inter', sans-serif" },
            bodyFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 6
          }
        }
      }
    };

    this.statusChartInstance = new Chart(ctx, config);
  }
}
