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
    <div class="flex flex-wrap gap-4 items-center mt-4 mb-2">
      
      <!-- Date Range Filter Row -->
      <div class="flex items-center gap-3">
        <!-- Custom Select Dropdown -->
        <div class="relative">
          <div (click)="toggleDropdown()" class="relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:border-teal-300 transition-all cursor-pointer" [class.border-teal-500]="isDropdownOpen" [class.ring-2]="isDropdownOpen" [class.ring-teal-500]="isDropdownOpen">
            <div class="pl-3 pr-2 py-2 flex items-center justify-center border-r border-gray-100 bg-gray-50 rounded-l-lg transition-colors" [class.bg-teal-50]="isDropdownOpen">
              <lucide-icon [img]="CalendarIcon" class="w-4 h-4 transition-colors" [class.text-teal-600]="!isDropdownOpen" [class.text-teal-700]="isDropdownOpen"></lucide-icon>
            </div>
            <div class="w-40 py-2.5 pl-3 pr-8 text-sm font-medium text-gray-800 select-none">
              {{ selectedLabel }}
            </div>
            <div class="absolute right-3 pointer-events-none flex items-center pl-1">
              <svg class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="isDropdownOpen" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <!-- Dropdown Menu -->
          <div *ngIf="isDropdownOpen" class="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden py-1 transform origin-top animate-fade-in-up" style="animation-duration: 0.15s;">
            <div *ngFor="let option of options" 
                 (click)="selectOption(option.value)"
                 class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between"
                 [ngClass]="dateRange === option.value ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'">
              {{ option.label }}
              <svg *ngIf="dateRange === option.value" class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
        </div>
        
        <!-- Invisible Backdrop to close dropdown -->
        <div *ngIf="isDropdownOpen" (click)="isDropdownOpen = false" class="fixed inset-0 z-40"></div>
      </div>
      
      <!-- Custom Range Picker -->
      <div *ngIf="dateRange === 'CUSTOM'" class="flex items-center bg-white border border-gray-200 p-1 rounded-lg shadow-sm hover:border-teal-300 transition-all focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 z-10">
          
          <!-- Start Date -->
          <div class="relative flex items-center gap-2 px-3 py-1 cursor-pointer rounded hover:bg-gray-50 transition-colors" (click)="openCustomDatePicker('start', $event)">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">From</span>
            <div class="text-sm font-medium py-1 px-1 min-w-[90px]" [class.text-gray-800]="startDate" [class.text-gray-400]="!startDate">
              {{ startDate ? (startDate | date:'MMM d, yyyy') : 'Select Date' }}
            </div>
            
            <!-- Calendar Popup Start -->
            <div *ngIf="activeDateField === 'start'" class="fixed inset-0 z-40 cursor-default" (click)="closeCustomPickers(); $event.stopPropagation()"></div>
            <div *ngIf="activeDateField === 'start'" class="absolute bg-white shadow-xl rounded-xl p-3 border border-gray-100 animate-fade-in-up z-50 cursor-default" style="top: 120%; left: 0; min-width: 260px;" (click)="$event.stopPropagation()">
              <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" (click)="prevMonth($event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span class="font-bold text-sm text-gray-800">{{ currentMonthDate | date:'MMMM yyyy' }}</span>
                <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" (click)="nextMonth($event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center mb-1">
                <div class="text-[11px] font-bold text-gray-400" *ngFor="let day of weekDays">{{ day }}</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center">
                <div *ngFor="let d of calendarDays" 
                     class="w-8 h-8 flex items-center justify-center text-sm rounded-md cursor-pointer transition-colors"
                     [ngClass]="{
                       'text-gray-300': !d.isCurrentMonth,
                       'text-gray-700 hover:bg-gray-100': d.isCurrentMonth && (startDate | date:'yyyy-MM-dd') !== (d.date | date:'yyyy-MM-dd'),
                       'bg-teal-600 text-white font-bold shadow-sm': (startDate | date:'yyyy-MM-dd') === (d.date | date:'yyyy-MM-dd')
                     }"
                     (click)="selectDate(d.date, $event)">
                  {{ d.day }}
                </div>
              </div>
              <div class="flex justify-between mt-2 pt-2 border-t border-gray-100">
                <button class="text-xs font-bold text-teal-600 hover:text-teal-700 px-2 py-1" (click)="selectDate(todayDate, $event)">Today</button>
                <button class="text-xs font-bold text-gray-400 hover:text-red-500 px-2 py-1" (click)="clearDate($event)">Clear</button>
              </div>
            </div>
          </div>

          <div class="h-6 w-px bg-gray-200 mx-1"></div>

          <!-- End Date -->
          <div class="relative flex items-center gap-2 px-3 py-1 cursor-pointer rounded hover:bg-gray-50 transition-colors" (click)="openCustomDatePicker('end', $event)">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">To</span>
            <div class="text-sm font-medium py-1 px-1 min-w-[90px]" [class.text-gray-800]="endDate" [class.text-gray-400]="!endDate">
              {{ endDate ? (endDate | date:'MMM d, yyyy') : 'Select Date' }}
            </div>

            <!-- Calendar Popup End -->
            <div *ngIf="activeDateField === 'end'" class="fixed inset-0 z-40 cursor-default" (click)="closeCustomPickers(); $event.stopPropagation()"></div>
            <div *ngIf="activeDateField === 'end'" class="absolute bg-white shadow-xl rounded-xl p-3 border border-gray-100 animate-fade-in-up z-50 cursor-default" style="top: 120%; right: 0; min-width: 260px;" (click)="$event.stopPropagation()">
              <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" (click)="prevMonth($event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span class="font-bold text-sm text-gray-800">{{ currentMonthDate | date:'MMMM yyyy' }}</span>
                <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" (click)="nextMonth($event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center mb-1">
                <div class="text-[11px] font-bold text-gray-400" *ngFor="let day of weekDays">{{ day }}</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center">
                <div *ngFor="let d of calendarDays" 
                     class="w-8 h-8 flex items-center justify-center text-sm rounded-md cursor-pointer transition-colors"
                     [ngClass]="{
                       'text-gray-300': !d.isCurrentMonth,
                       'text-gray-700 hover:bg-gray-100': d.isCurrentMonth && (endDate | date:'yyyy-MM-dd') !== (d.date | date:'yyyy-MM-dd'),
                       'bg-teal-600 text-white font-bold shadow-sm': (endDate | date:'yyyy-MM-dd') === (d.date | date:'yyyy-MM-dd')
                     }"
                     (click)="selectDate(d.date, $event)">
                  {{ d.day }}
                </div>
              </div>
              <div class="flex justify-between mt-2 pt-2 border-t border-gray-100">
                <button class="text-xs font-bold text-teal-600 hover:text-teal-700 px-2 py-1" (click)="selectDate(todayDate, $event)">Today</button>
                <button class="text-xs font-bold text-gray-400 hover:text-red-500 px-2 py-1" (click)="clearDate($event)">Clear</button>
              </div>
            </div>
          </div>

          <div class="pl-2 pr-1 border-l border-gray-100">
            <button (click)="applyCustomRange()" class="px-4 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-bold shadow-sm">
              Apply
            </button>
          </div>
        </div>
      </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp ease-out forwards;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AnalyticsFilter implements OnInit {
  @Output() dateRangeChange = new EventEmitter<{startDate: string, endDate: string}>();

  dateRange: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM' = 'LAST_30_DAYS';
  startDate: string = '';
  endDate: string = '';
  isDropdownOpen = false;

  activeDateField: 'start' | 'end' | null = null;
  currentMonthDate: Date = new Date();
  calendarDays: {date: Date, day: number, isCurrentMonth: boolean}[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  CalendarIcon = Calendar;
  
  options = [
    { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'THIS_YEAR', label: 'This Year' },
    { value: 'CUSTOM', label: 'Custom Range' }
  ];

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.updateDateRange();
  }
  
  get selectedLabel() {
    return this.options.find(o => o.value === this.dateRange)?.label || '';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(value: any) {
    this.dateRange = value;
    this.isDropdownOpen = false;
    this.onDateRangeChange();
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

  openCustomDatePicker(field: 'start' | 'end', event: Event) {
    event.stopPropagation();
    if (this.activeDateField === field) {
      this.activeDateField = null;
      return;
    }
    this.activeDateField = field;
    this.isDropdownOpen = false;
    let currentVal = '';
    if (field === 'start') currentVal = this.startDate;
    if (field === 'end') currentVal = this.endDate;

    this.currentMonthDate = currentVal ? new Date(currentVal) : new Date();
    this.generateCalendar(this.currentMonthDate);
  }

  generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({ date: new Date(year, month - 1, daysInPrevMonth - i), day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({ date: new Date(year, month, i), day: i, isCurrentMonth: true });
    }
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({ date: new Date(year, month + 1, i), day: i, isCurrentMonth: false });
    }
  }

  prevMonth(event: Event) {
    event.stopPropagation();
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() - 1, 1);
    this.generateCalendar(this.currentMonthDate);
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);
    this.generateCalendar(this.currentMonthDate);
  }

  selectDate(d: Date, event: Event) {
    event.stopPropagation();
    const dateStr = this.datePipe.transform(d, 'yyyy-MM-dd') || '';

    if (this.activeDateField === 'start') {
      this.startDate = dateStr;
    } else if (this.activeDateField === 'end') {
      this.endDate = dateStr;
    }
    this.activeDateField = null;
  }

  clearDate(event: Event) {
    event.stopPropagation();
    if (this.activeDateField === 'start') this.startDate = '';
    if (this.activeDateField === 'end') this.endDate = '';
    this.activeDateField = null;
  }

  closeCustomPickers() {
    this.activeDateField = null;
  }

  get todayDate(): Date {
    return new Date();
  }
}
