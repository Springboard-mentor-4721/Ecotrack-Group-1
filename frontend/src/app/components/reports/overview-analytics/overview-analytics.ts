import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { SustainabilityAnalyticsDTO, CarbonAnalyticsDTO } from '../../../models/report.models';
import { LucideAngularModule, Leaf, Target, Award, TrendingUp, TrendingDown, Zap, ChartNoAxesColumn, Cloud, CircleCheck, Star, Compass, ArrowRight, CircleAlert, Info, Minus } from 'lucide-angular';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-overview-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  providers: [DecimalPipe, provideCharts(withDefaultRegisterables())],
  templateUrl: './overview-analytics.html'
})
export class OverviewAnalytics implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Output() navigate = new EventEmitter<string>();

  LeafIcon = Leaf;
  TargetIcon = Target;
  AwardIcon = Award;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  MinusIcon = Minus;
  ZapIcon = Zap;
  ChartNoAxesColumnIcon = ChartNoAxesColumn;
  CloudIcon = Cloud;
  CircleCheckIcon = CircleCheck;
  StarIcon = Star;
  CompassIcon = Compass;
  ArrowRightIcon = ArrowRight;
  CircleAlertIcon = CircleAlert;
  InfoIcon = Info;

  data = signal<{ sus: SustainabilityAnalyticsDTO, carbon: CarbonAnalyticsDTO } | null>(null);
  isLoading = signal(false);
  error = signal('');
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

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.loadData();
    }
  }

  loadData(): void {
    if (!this.startDate || !this.endDate) return;
    
    this.isLoading.set(true);
    this.error.set('');
    this.data.set(null);
    
    forkJoin({
      sus: this.reportService.getSustainabilityAnalytics(this.startDate, this.endDate),
      carbon: this.reportService.getCarbonAnalytics(this.startDate, this.endDate)
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (res) => {
        this.data.set(res);
        this.updateTrendChart(res.carbon);
      },
      error: (err) => {
        console.error('Error fetching overview reports', err);
        this.error.set('Unable to load your analytics. Something went wrong while loading this report.');
      }
    });
  }

  updateTrendChart(carbonData: CarbonAnalyticsDTO): void {
    if (!carbonData || !carbonData.trend || carbonData.trend.length === 0) {
      this.trendChartData.set({ labels: [], datasets: [] });
      return;
    }

    this.trendChartData.set({
      labels: carbonData.trend.map(t => this.formatTrendDate(t.date)),
      datasets: [{
        data: carbonData.trend.map(t => t.emission),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#10b981'
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
  
  onNavigate(tab: string) {
    this.navigate.emit(tab);
  }
}
