import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import { OverviewReportDTO } from '../../../models/report.models';
import { LucideAngularModule, Leaf, Target, Award, TrendingUp, Zap, ChartNoAxesColumn, Cloud, CircleCheck, Star, Compass, ArrowRight, CircleAlert } from 'lucide-angular';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-overview-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './overview-analytics.html'
})
export class OverviewAnalytics implements OnChanges {
  ChartNoAxesColumnIcon = ChartNoAxesColumn;
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Output() navigate = new EventEmitter<string>();

  LeafIcon = Leaf;
  TargetIcon = Target;
  AwardIcon = Award;
  TrendingUpIcon = TrendingUp;
  ZapIcon = Zap;
  BarChartIcon = ChartNoAxesColumn;
  CloudIcon = Cloud;
  CircleCheckIcon = CircleCheck;
  StarIcon = Star;
  CompassIcon = Compass;
  ArrowRightIcon = ArrowRight;
  CircleAlertIcon = CircleAlert;

  data = signal<OverviewReportDTO | null>(null);
  isLoading = signal(false);
  error = signal('');

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
    
    this.reportService.getOverviewReport(this.startDate, this.endDate)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.data.set(data);
        },
        error: (err) => {
          console.error('Error fetching overview report', err);
          this.error.set('Unable to load your analytics. Something went wrong while loading this report.');
        }
      });
  }
  
  onNavigate(tab: string) {
    this.navigate.emit(tab);
  }
}
