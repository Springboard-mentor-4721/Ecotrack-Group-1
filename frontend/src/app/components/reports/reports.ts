import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AnalyticsFilter } from './analytics-filter/analytics-filter';
import { AnalyticsNavigation } from './analytics-navigation/analytics-navigation';
import { OverviewAnalytics } from './overview-analytics/overview-analytics';
import { CarbonAnalytics } from './carbon-analytics/carbon-analytics';
import { GoalsAnalytics } from './goals-analytics/goals-analytics';
import { ChallengeAnalytics } from './challenge-analytics/challenge-analytics';
import { SustainabilityAnalytics } from './sustainability-analytics/sustainability-analytics';
import { XpActivityAnalytics } from './xp-activity-analytics/xp-activity-analytics';
import { ReportService } from '../../services/report.service';
import { LucideAngularModule, FileText, Download } from 'lucide-angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AnalyticsFilter,
    AnalyticsNavigation,
    OverviewAnalytics,
    CarbonAnalytics,
    GoalsAnalytics,
    ChallengeAnalytics,
    SustainabilityAnalytics,
    XpActivityAnalytics
  ],
  providers: [DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  FileTextIcon = FileText;
  DownloadIcon = Download;
  currentTab: 'overview' | 'carbon' | 'goals' | 'challenges' | 'sustainability' | 'xp-activity' = 'overview';

  startDate: string = '';
  endDate: string = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Initial dates set by filter component
  }

  onTabChanged(tab: any): void {
    this.currentTab = tab;
  }

  onDateRangeChanged(dates: { startDate: string, endDate: string }): void {
    this.startDate = dates.startDate;
    this.endDate = dates.endDate;
  }

  exportReport(format: 'PDF' | 'EXCEL'): void {
    // Will be handled in Phase 8, but preserving the structure
    // We can use the currentTab if it's one of the old ones, or block it for now
    let type = this.currentTab;
    if (type === 'overview' || type === 'xp-activity') {
      return;
    }

    this.reportService.exportReportBlob(type, format, this.startDate, this.endDate)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const ext = format === 'PDF' ? 'pdf' : 'xlsx';
          a.download = `ecotrack-${this.currentTab}-report-${this.startDate}-to-${this.endDate}.${ext}`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Export failed', err)
      });
  }
}
