import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarbonEntryService } from '../../services/carbon-entry.service';
import { CarbonSummaryResponse } from '../../models/carbon.models';
import { finalize } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { LucideAngularModule, PieChart, BarChart2, Calendar, Download } from 'lucide-angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  summary: CarbonSummaryResponse | null = null;
  isLoading = false;
  errorMessage = '';

  // Filters
  startDate: string = '';
  endDate: string = '';
  dateRange: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM' = 'LAST_30_DAYS';

  // Icons
  PieChartIcon = PieChart;
  BarChartIcon = BarChart2;
  CalendarIcon = Calendar;
  DownloadIcon = Download;

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
    private carbonService: CarbonEntryService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.updateDateRange();
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
    this.summary = null;

    this.carbonService.getDashboardSummary(this.startDate, this.endDate)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.updateCharts(data);
        },
        error: (err) => {
          console.error('Error fetching report:', err);
          this.errorMessage = 'Failed to load report data. Please try again.';
        }
      });
  }

  updateCharts(data: CarbonSummaryResponse): void {
    const labels = data.categorySummaries.map(c => c.categoryName);
    const emissions = data.categorySummaries.map(c => c.totalEmission);

    // Update Pie Chart
    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: emissions,
        backgroundColor: ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#94a3b8']
      }]
    };

    // Update Bar Chart
    this.barChartData = {
      labels: labels,
      datasets: [{
        data: emissions,
        label: 'Emissions (kg CO2e)',
        backgroundColor: '#4ade80'
      }]
    };
  }

  exportReport(): void {
    // Basic CSV export of the summary data
    if (!this.summary || this.summary.categorySummaries.length === 0) return;
    
    let csv = 'Category,Total Emission (kg CO2e),Percentage\n';
    this.summary.categorySummaries.forEach(c => {
      csv += `"${c.categoryName}",${c.totalEmission},${c.percentage}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emission-report-${this.startDate}-to-${this.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
