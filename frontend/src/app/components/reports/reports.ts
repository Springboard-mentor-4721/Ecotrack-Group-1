import { Component, OnInit, HostListener } from '@angular/core';
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
import { ToastService } from '../../shared/services/toast.service';
import { LucideAngularModule, FileText, Download, X, ChevronDown } from 'lucide-angular';

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
  ChevronDownIcon = ChevronDown;
  
  showExportModal = false;
  pendingExportFormat: 'PDF' | 'EXCEL' | 'CSV' | null = null;
  currentTab: 'overview' | 'carbon' | 'goals' | 'challenges' | 'sustainability' | 'xp-activity' = 'overview';

  isExportMenuOpen = false;
  isExporting = false;

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
    private route: ActivatedRoute,
    private toastService: ToastService
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isExportMenuOpen = false;
    }
  }

  toggleExportMenu(event: Event) {
    event.stopPropagation();
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  downloadOverviewReport(format: string) {
    this.isExportMenuOpen = false;
    this.isExporting = true;
    
    this.reportService.exportReportBlob('sustainability', format, this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          this.isExporting = false;
          if (!response.body) {
            this.toastService.error('Failed to generate report.');
            return;
          }
          
          const blob = response.body;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          let filename = '';
          const contentDisposition = response.headers.get('Content-Disposition');
          if (contentDisposition && contentDisposition.includes('filename=')) {
            const parts = contentDisposition.split('filename=');
            if (parts.length > 1) {
              filename = parts[1].split(';')[0].replace(/['"]/g, '');
            }
          }
          
          if (!filename) {
            const ext = format === 'PDF' ? 'pdf' : format === 'CSV' ? 'zip' : 'xlsx';
            filename = `EcoTrack_Overall_Report_${this.startDate}_to_${this.endDate}.${ext}`;
          }
          
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toastService.success('Report downloaded successfully');
        },
        error: (err) => {
          this.isExporting = false;
          console.error('Export failed', err);
          this.toastService.error('Unable to generate the report. Please try again.');
        }
      });
  }

  confirmExport(): void {
    if (!this.pendingExportFormat) return;
    const format = this.pendingExportFormat;
    this.closeExportModal();

    // We can use the currentTab if it's one of the old ones, or block it for now
    let type = this.currentTab;
    if (type === 'overview' || type === 'xp-activity') {
      return;
    }

    this.reportService.exportReportBlob(type, format, this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          if (!response.body) return;
          const blob = response.body;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          let filename = '';
          const contentDisposition = response.headers.get('Content-Disposition');
          if (contentDisposition && contentDisposition.includes('filename=')) {
            const parts = contentDisposition.split('filename=');
            if (parts.length > 1) {
              filename = parts[1].split(';')[0].replace(/['"]/g, '');
            }
          }
          if (!filename) {
            const ext = format === 'PDF' ? 'pdf' : format === 'CSV' ? 'zip' : 'xlsx';
            filename = `ecotrack-${this.currentTab}-report-${this.startDate}-to-${this.endDate}.${ext}`;
          }
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toastService.success('Report downloaded successfully');
        },
        error: (err) => {
          console.error('Export failed', err);
          this.toastService.error('Unable to generate the report. Please try again.');
        }
      });
  }
}
