import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsFilter } from './analytics-filter/analytics-filter';
import { AnalyticsNavigation } from './analytics-navigation/analytics-navigation';
import { OverviewAnalytics } from './overview-analytics/overview-analytics';
import { CarbonAnalytics } from './carbon-analytics/carbon-analytics';
import { GoalsAnalytics } from './goals-analytics/goals-analytics';
import { ChallengeAnalytics } from './challenge-analytics/challenge-analytics';
import { SustainabilityAnalytics } from './sustainability-analytics/sustainability-analytics';
import { ReportService } from '../../services/report.service';
import { LucideAngularModule, FileText, Download, X } from 'lucide-angular';

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
    SustainabilityAnalytics
  ],
  providers: [DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  FileTextIcon = FileText;
  DownloadIcon = Download;
  XIcon = X;
  
  showExportModal = false;
  pendingExportFormat: 'PDF' | 'EXCEL' | 'CSV' | null = null;
  currentTab: 'overview' | 'carbon' | 'goals' | 'challenges' | 'sustainability' | 'xp-activity' = 'overview';

  startDate: string = '';
  endDate: string = '';

  get currentTabName(): string {
    const tabMap: Record<string, string> = {
      'overview': 'Overview Analytics',
      'carbon': 'Carbon Analytics',
      'goals': 'Goals Analytics',
      'challenges': 'Challenges Analytics',
      'sustainability': 'Eco Progress',
      'xp-activity': 'XP Activity'
    };
    return tabMap[this.currentTab] || 'Analytics';
  }

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initial dates set by filter component
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const allowedTabs = ['overview', 'carbon', 'goals', 'challenges', 'sustainability', 'xp-activity'];
        if (allowedTabs.includes(params['tab'])) {
          this.currentTab = params['tab'] as any;
        }
      }
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  onTabChanged(tab: any): void {
    this.currentTab = tab;
  }

  onDateRangeChanged(dates: { startDate: string, endDate: string }): void {
    this.startDate = dates.startDate;
    this.endDate = dates.endDate;
  }

  openExportModal(format: 'PDF' | 'EXCEL' | 'CSV'): void {
    this.pendingExportFormat = format;
    this.showExportModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeExportModal(): void {
    this.showExportModal = false;
    this.pendingExportFormat = null;
    document.body.style.overflow = '';
  }

  confirmExport(): void {
    if (!this.pendingExportFormat) return;
    const format = this.pendingExportFormat;
    this.closeExportModal();

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
          const ext = format === 'PDF' ? 'pdf' : format === 'CSV' ? 'csv' : 'xlsx';
          a.download = `ecotrack-${this.currentTab}-report-${this.startDate}-to-${this.endDate}.${ext}`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Export failed', err)
      });
  }
}
