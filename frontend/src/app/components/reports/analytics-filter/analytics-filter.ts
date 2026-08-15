import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar } from 'lucide-angular';

@Component({
  selector: 'app-analytics-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [DatePipe],
  template: `
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Date Range</label>
        <div class="flex items-center gap-2">
          <lucide-icon [img]="CalendarIcon" class="w-5 h-5 text-gray-400"></lucide-icon>
          <select [(ngModel)]="dateRange" (change)="onDateRangeChange()" class="border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="THIS_YEAR">This Year</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>
      </div>
      
      <div *ngIf="dateRange === 'CUSTOM'" class="flex gap-4 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" [(ngModel)]="startDate" class="border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">End Date</label>
          <input type="date" [(ngModel)]="endDate" class="border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
        </div>
        <button (click)="applyCustomRange()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
          Apply
        </button>
      </div>
    </div>
  `
})
export class AnalyticsFilter implements OnInit {
  @Output() dateRangeChange = new EventEmitter<{startDate: string, endDate: string}>();

  dateRange: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM' = 'LAST_30_DAYS';
  startDate: string = '';
  endDate: string = '';

  CalendarIcon = Calendar;

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.updateDateRange();
  }

  onDateRangeChange(): void {
    if (this.dateRange !== 'CUSTOM') {
      this.updateDateRange();
    }
  }

  applyCustomRange(): void {
    if (this.startDate && this.endDate) {
      this.dateRangeChange.emit({ startDate: this.startDate, endDate: this.endDate });
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
        return;
    }

    this.startDate = this.datePipe.transform(start, 'yyyy-MM-dd') || '';
    this.endDate = this.datePipe.transform(end, 'yyyy-MM-dd') || '';
    
    if (this.startDate && this.endDate) {
      this.dateRangeChange.emit({ startDate: this.startDate, endDate: this.endDate });
    }
  }
}
