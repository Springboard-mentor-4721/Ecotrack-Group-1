import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { finalize } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LucideAngularModule, PieChart, BarChart2, Calendar, Download, FileText, Target, Award, Leaf } from 'lucide-angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  // Tabs
  currentTab: 'carbon' | 'goals' | 'challenges' | 'sustainability' = 'carbon';

  // Data
  reportData: any = null;

  // Filters
  startDate: string = '';
  endDate: string = '';
  dateRange: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM' = 'LAST_30_DAYS';

  // Icons
  PieChartIcon = PieChart;
  BarChartIcon = BarChart2;
  CalendarIcon = Calendar;
  DownloadIcon = Download;
  FileTextIcon = FileText;
  TargetIcon = Target;
  AwardIcon = Award;
  LeafIcon = Leaf;

  // Chart config
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Emissions (kg CO2e)' }]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'kg CO2e' } }
    }
  };

  constructor(
    private reportService: ReportService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.updateDateRange();
  }

  setTab(tab: 'carbon' | 'goals' | 'challenges' | 'sustainability') {
    this.currentTab = tab;
    this.loadReport();
  }

  onDateRangeChange(): void {
    if (this.dateRange !== 'CUSTOM') {
      this.updateDateRange();
    }
  }

  updateDateRange(): void {
    const end = new Date();
    let start = new Date();

    switch (this.dateRange) {
      case 'LAST_7_DAYS':
        start.setDate(end.getDate() - 7);
        break;
      case 'LAST_30_DAYS':
        start.setDate(end.getDate() - 30);
        break;
      case 'THIS_MONTH':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'THIS_YEAR':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case 'CUSTOM':
        return; // Don't auto-update if custom
    }

    this.startDate = this.datePipe.transform(start, 'yyyy-MM-dd') || '';
    this.endDate = this.datePipe.transform(end, 'yyyy-MM-dd') || '';
    
    if (this.startDate && this.endDate) {
      this.loadReport();
    }
  }

  loadReport(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.reportData = null;

    let request;
    if (this.currentTab === 'carbon') {
      request = this.reportService.getCarbonReport(this.startDate, this.endDate);
    } else if (this.currentTab === 'goals') {
      request = this.reportService.getGoalReport(this.startDate, this.endDate);
    } else if (this.currentTab === 'challenges') {
      request = this.reportService.getChallengeReport(this.startDate, this.endDate);
    } else {
      request = this.reportService.getSustainabilityReport(this.startDate, this.endDate);
    }

    request.pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (data) => {
        this.reportData = data;
        if (this.currentTab === 'carbon') {
          this.updateCharts(data);
        }
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.errorMessage = 'Failed to load report data. Please try again.';
      }
    });
  }

  updateCharts(data: any): void {
    if (!data.emissionsByCategory) return;
    const labels = Object.keys(data.emissionsByCategory);
    const emissions = Object.values(data.emissionsByCategory) as number[];

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: emissions,
        backgroundColor: ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#94a3b8']
      }]
    };

    this.barChartData = {
      labels: labels,
      datasets: [{
        data: emissions,
        label: 'Emissions (kg CO2e)',
        backgroundColor: '#4ade80'
      }]
    };
  }

  exportReport(format: 'PDF' | 'EXCEL'): void {
    if (!this.reportData) return;
    this.isLoading = true;
    this.reportService.exportReportBlob(this.currentTab, format, this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoading = false))
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
        error: (err) => {
          console.error('Export failed', err);
          this.errorMessage = `Failed to generate ${format} report.`;
        }
      });
  }
}
