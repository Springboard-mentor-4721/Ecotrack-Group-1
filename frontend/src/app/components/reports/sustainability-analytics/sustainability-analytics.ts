import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { SustainabilityAnalyticsDTO } from '../../../models/report.models';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { LucideAngularModule, Leaf, Target, Trophy, Flame, TrendingUp, TrendingDown, Minus, Info, ArrowRight, Activity, ArrowUpRight, ArrowDownRight, CircleDot, CircleCheck, Swords } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { XpActivityAnalytics } from '../xp-activity-analytics/xp-activity-analytics';

Chart.register(...registerables);

@Component({
  selector: 'app-sustainability-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, XpActivityAnalytics],
  templateUrl: './sustainability-analytics.html'
})
export class SustainabilityAnalytics implements OnChanges, AfterViewInit {
  SwordsIcon = Swords;
  CircleCheckIcon = CircleCheck;
  CircleDotIcon = CircleDot;
  ArrowDownRightIcon = ArrowDownRight;
  ArrowUpRightIcon = ArrowUpRight;
  ActivityIcon = Activity;
  ArrowRightIcon = ArrowRight;
  InfoIcon = Info;
  MinusIcon = Minus;
  TrendingDownIcon = TrendingDown;
  TrendingUpIcon = TrendingUp;
  FlameIcon = Flame;
  TrophyIcon = Trophy;
  TargetIcon = Target;
  LeafIcon = Leaf;
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  analyticsData = signal<SustainabilityAnalyticsDTO | null>(null);
  isLoading = signal(true);
  errorMsg = signal('');

  @ViewChild('comparisonChart') chartRef!: ElementRef<HTMLCanvasElement>;
  private chartInstance: any | null = null;

  readonly Leaf = Leaf;
  readonly Target = Target;
  readonly Trophy = Trophy;
  readonly Flame = Flame;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly Info = Info;
  readonly ArrowRight = ArrowRight;
  readonly Activity = Activity;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownRight = ArrowDownRight;
  readonly CircleDot = CircleDot;
  readonly CircleCheck = CircleCheck;

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.loadData();
    }
  }

  ngAfterViewInit(): void {
    if (this.analyticsData()) {
      this.updateChart();
    }
  }

  loadData(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoading.set(true);
    this.errorMsg.set('');
    
    this.reportService.getSustainabilityAnalytics(this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
      next: (data) => {
        this.analyticsData.set(data);
        this.updateChart();
      },
      error: (err) => {
        console.error('Error fetching sustainability analytics', err);
        this.errorMsg.set('We couldn\'t retrieve your sustainability data. Please try again.');
      }
    });
  }

  private updateChart(): void {
    const data = this.analyticsData();
    if (!this.chartRef || !data) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const currentData = [
      data.completedGoals,
      data.completedChallenges
    ];

    const prevData = [
      data.previousCompletedGoals,
      data.previousCompletedChallenges
    ];

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Goals Completed', 'Challenges Completed'],
        datasets: [
          {
            label: 'Current Period',
            data: currentData,
            backgroundColor: '#10b981', // emerald-500
            borderRadius: 6,
            maxBarThickness: 48,
            borderSkipped: false
          },
          {
            label: 'Previous Period',
            data: prevData,
            backgroundColor: '#e5e7eb', // gray-200
            borderRadius: 6,
            maxBarThickness: 48,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10, bottom: 10 }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { 
              font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' },
              usePointStyle: true,
              boxWidth: 8,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: { family: "'Inter', sans-serif" },
            bodyFont: { family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: 'rgba(0,0,0,0.05)' },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    };

    this.chartInstance = new Chart(ctx, config);
  }
}
