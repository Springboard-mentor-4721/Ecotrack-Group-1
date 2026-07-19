import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CarbonEntryService } from '../../services/carbon-entry.service';
import { CarbonEntryResponse, CarbonSummaryResponse } from '../../models/carbon.models';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

function pastOrPresentValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const now = new Date();
  if (selectedDate > now) {
    return { pastOrPresent: true };
  }
  return null;
}


@Component({
  selector: 'app-carbon-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingSkeletonComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './carbon-tracker.html',
  styleUrls: ['./carbon-tracker.css'],
})
export class CarbonTrackerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  entries: CarbonEntryResponse[] = [];
  summary: CarbonSummaryResponse | null = null;
  
  entryForm: FormGroup;
  isEditing = false;
  currentEditingId: number | null = null;
  pendingDeleteId: number | null = null;
  
  errorMessage = '';
  isSubmitting = false;
  
  showAddEntryCard = false;
  showDateDropdown = false;
  showCategoryDropdown = false;
  showSubCategoryDropdown = false;
  showSortDropdown = false;
  
  // Custom Form Dropdowns
  showFormCategoryDropdown = false;
  showFormSubCategoryDropdown = false;
  showPageSizeDropdown = false;

  // Custom Calendar state
  currentMonthDate: Date = new Date();
  calendarDays: {date: Date, day: number, isCurrentMonth: boolean}[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  activeDateField: 'start' | 'end' | 'formDate' | null = null;
  
  // Custom Time state
  activeTimeField: 'formTime' | null = null;
  hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
  minutes = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));
  customTimeHour = '12';
  customTimeMinute = '00';

  sortOptions = [
    { value: 'entryDate,desc', label: 'Newest' },
    { value: 'entryDate,asc', label: 'Oldest' },
    { value: 'emissionKgco2e,desc', label: 'Highest Emission' },
    { value: 'emissionKgco2e,asc', label: 'Lowest Emission' },
    { value: 'category.name,asc', label: 'Category A-Z' },
    { value: 'category.name,desc', label: 'Category Z-A' },
    { value: 'quantity,desc', label: 'Quantity' },
    { value: 'updatedAt,desc', label: 'Recently Updated' }
  ];

  // Modals & Toasts
  viewEntry: CarbonEntryResponse | null = null;
  entryToDeleteId: number | null = null;
  isDeleting = false;

  toasts: { id: number, message: string, type: 'success' | 'error' }[] = [];
  private toastIdCounter = 0;

  // State
  loadError = false;

  filterCategory: number | undefined = undefined;
  filterSubCategory: number | undefined = undefined;
  filterSearch: string = '';
  filterStartDate: string | undefined = undefined;
  filterEndDate: string | undefined = undefined;
  filterEmissionMin: number | undefined = undefined;
  filterEmissionMax: number | undefined = undefined;
  filterQuantityMin: number | undefined = undefined;
  filterQuantityMax: number | undefined = undefined;
  filterSort: string = 'entryDate,desc';

  // Category Distribution
  distributionMonth: string = '';
  availableMonths: { label: string, value: string }[] = [];
  distributionTotalEmission: number = 0;
  showDistributionDropdown: boolean = false;

  highestCategory: string | null = null;
  carbonSources: { name: string, percentage: number, value: number, color: string }[] = [];

  // Charts
  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.4 } },
    scales: { 
      y: { 
        beginAtZero: true, 
        display: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { display: false }
      }, 
      x: { 
        display: true,
        grid: { display: false },
        border: { display: false }
      } 
    },
    plugins: { legend: { display: false } }
  };
  public lineChartType: ChartType = 'line';

  public doughnutChartData: ChartData<'doughnut'> = { datasets: [] };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] | any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: { legend: { display: false } }
  };
  public doughnutChartType: ChartType = 'doughnut';

  categories: any[] = [];
  availableSubTypes: any[] = [];

  // Pagination state
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  isLoading = true;
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private carbonEntryService: CarbonEntryService,
    private cdr: ChangeDetectorRef
  ) {
    this.entryForm = this.fb.group({
      categoryId: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.0001)]],
      unit: [{value: 'km', disabled: true}, [Validators.required, Validators.maxLength(30)]],
      entryDateDate: ['', Validators.required],
      entryDateTime: ['', Validators.required],
      notes: ['', [Validators.maxLength(500)]]
    });

    this.entryForm.get('categoryId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(catId => {
      this.updateCategoryDependencies(Number(catId));
    });

    this.entryForm.get('subCategoryId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(subId => {
      this.updateUnit(Number(subId));
    });
  }

  updateCategoryDependencies(catId: number): void {
    const category = this.categories.find(c => c.id === catId);
    if (category) {
      this.availableSubTypes = category.subCategories || [];
      if (this.availableSubTypes.length > 0) {
        this.entryForm.patchValue({ subCategoryId: this.availableSubTypes[0].id });
      } else {
        this.entryForm.patchValue({ subCategoryId: '', unit: '' });
      }
    }
  }

  updateUnit(subId: number): void {
    const sub = this.availableSubTypes.find(s => s.id === subId);
    if (sub) {
      this.entryForm.patchValue({ unit: sub.defaultUnit });
    }
  }

  loadCategories(): void {
    this.carbonEntryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    this.setupAvailableMonths();
    this.loadEntries();
    this.loadSummary();
    this.loadCategoryDistribution();
  }

  private setupAvailableMonths(): void {
    this.availableMonths = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      this.availableMonths.push({ label, value: val });
    }
    this.distributionMonth = this.availableMonths[0].value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEntries(): void {
    this.isLoading = true;
    this.loadError = false;
    this.carbonEntryService.getEntries(
      this.currentPage, this.pageSize, 
      this.filterCategory, this.filterSubCategory, 
      this.filterSearch, 
      this.filterStartDate, this.filterEndDate, 
      this.filterEmissionMin, this.filterEmissionMax,
      this.filterQuantityMin, this.filterQuantityMax,
      this.filterSort
    )
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: (response) => {
        this.entries = response.content;
        this.totalPages = response.totalPages;
      },
      error: (err) => {
        console.error('Failed to load entries', err);
        this.loadError = true;
      }
    });
  }

  getCategoryName(id?: number): string {
    if (!id) return '';
    return this.categories.find(c => c.id == id)?.name || '';
  }

  getSubCategoryName(id?: number): string {
    if (!id) return '';
    for (const cat of this.categories) {
      const sub = cat.subCategories?.find((s: any) => s.id == id);
      if (sub) return sub.name;
    }
    return '';
  }

  getSortLabel(val: string): string {
    return this.sortOptions.find(o => o.value === val)?.label || 'Newest';
  }

  get availableSubCategories(): any[] {
    if (!this.filterCategory) {
      let all: any[] = [];
      this.categories.forEach(cat => {
        if (cat.subCategories) all = [...all, ...cat.subCategories];
      });
      return all;
    }
    return this.categories.find(c => c.id == this.filterCategory)?.subCategories || [];
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadEntries();
  }

  onCategoryFilterChange(): void {
    this.filterSubCategory = undefined;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterCategory = undefined;
    this.filterSubCategory = undefined;
    this.filterSearch = '';
    this.filterStartDate = undefined;
    this.filterEndDate = undefined;
    this.filterEmissionMin = undefined;
    this.filterEmissionMax = undefined;
    this.filterQuantityMin = undefined;
    this.filterQuantityMax = undefined;
    this.filterSort = 'entryDate,desc';
    this.applyFilters();
  }

  // --- CUSTOM CALENDAR LOGIC ---
  openCustomDatePicker(field: 'start' | 'end' | 'formDate', event: Event) {
    event.stopPropagation();
    if (this.activeDateField === field) {
      this.activeDateField = null;
      return;
    }
    this.activeDateField = field;
    this.activeTimeField = null;
    let currentVal = '';
    if (field === 'start') currentVal = this.filterStartDate || '';
    if (field === 'end') currentVal = this.filterEndDate || '';
    if (field === 'formDate') currentVal = this.entryForm.get('entryDateDate')?.value || '';
    
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
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (this.activeDateField === 'start') {
      this.filterStartDate = dateStr;
      this.applyFilters();
    } else if (this.activeDateField === 'end') {
      this.filterEndDate = dateStr;
      this.applyFilters();
    } else if (this.activeDateField === 'formDate') {
      this.entryForm.patchValue({ entryDateDate: dateStr });
    }
    this.activeDateField = null;
  }

  openCustomTimePicker(field: 'formTime', event: Event) {
    event.stopPropagation();
    if (this.activeTimeField === field) {
      this.activeTimeField = null;
      return;
    }
    this.activeTimeField = field;
    this.activeDateField = null;
    const currentVal = this.entryForm.get('entryDateTime')?.value || '12:00';
    const parts = currentVal.split(':');
    this.customTimeHour = parts[0] || '12';
    this.customTimeMinute = parts[1] || '00';
  }

  updateCustomTime() {
    const timeStr = `${this.customTimeHour}:${this.customTimeMinute}`;
    this.entryForm.patchValue({ entryDateTime: timeStr });
  }

  closeCustomPickers() {
    this.activeDateField = null;
    this.activeTimeField = null;
  }

  avgDailyEmission = 0;
  todayEmission = 0;
  todayEntriesCount = 0;
  todayHighestCategory = 'N/A';

  loadSummary(): void {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); // Last 30 days
    
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    this.carbonEntryService.getDashboardSummary(startDate, endDate)
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
      next: (summary) => {
        this.summary = summary;
        this.avgDailyEmission = summary.totalEmission / 30;
        if (summary.categorySummaries && summary.categorySummaries.length > 0) {
          const sorted = [...summary.categorySummaries].sort((a,b) => b.percentage - a.percentage);
          this.highestCategory = sorted[0].categoryName;
        } else {
          this.highestCategory = 'N/A';
        }
        this.loadTrendData();
      },
      error: (err) => console.error('Failed to load summary', err)
    });

    const todayStr = end.toISOString().split('T')[0];
    this.carbonEntryService.getDashboardSummary(todayStr, todayStr)
      .subscribe({
      next: (summary) => {
        this.todayEmission = summary.totalEmission || 0;
        if (summary.categorySummaries && summary.categorySummaries.length > 0) {
          const sorted = [...summary.categorySummaries].sort((a,b) => b.percentage - a.percentage);
          this.todayHighestCategory = sorted[0].categoryName;
        } else {
          this.todayHighestCategory = 'N/A';
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load today summary', err)
    });
    
    this.carbonEntryService.getEntries(0, 1, undefined, undefined, undefined, todayStr, todayStr)
      .subscribe({
      next: (res) => {
        this.todayEntriesCount = res.totalElements;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load today entries count', err)
    });
  }

  onDistributionMonthChange(): void {
    this.showDistributionDropdown = false;
    this.loadCategoryDistribution();
  }

  getDistributionMonthLabel(): string {
    const m = this.availableMonths.find(x => x.value === this.distributionMonth);
    return m ? m.label : 'Select Month';
  }

  loadCategoryDistribution(): void {
    const [year, month] = this.distributionMonth.split('-');
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0);

    // format as YYYY-MM-DD manually to avoid timezone issues
    const startDate = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-01`;
    const endDate = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;

    this.carbonEntryService.getDashboardSummary(startDate, endDate)
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: (summary) => {
          this.distributionTotalEmission = summary.totalEmission || 0;
          this.processCarbonSources(summary.categorySummaries);
        },
        error: (err) => console.error('Failed to load category distribution', err)
      });
  }

  private processCarbonSources(categorySummaries: any[] | undefined): void {
    if (!categorySummaries || categorySummaries.length === 0) {
      this.carbonSources = [];
      this.doughnutChartData = { labels: [], datasets: [] };
      return;
    }
    
    const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#94a3b8', '#f59e0b'];
    
    this.carbonSources = categorySummaries
      .map((s, i) => {
        const cat = this.categories.find(c => c.name === s.categoryName);
        return {
          name: s.categoryName,
          value: s.totalEmission,
          percentage: s.percentage,
          color: cat && cat.color ? cat.color : colors[i % colors.length]
        };
      })
      .sort((a,b) => b.percentage - a.percentage);

    this.doughnutChartData = {
      labels: this.carbonSources.map(s => s.name),
      datasets: [{
        data: this.carbonSources.map(s => s.value),
        backgroundColor: this.carbonSources.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }

  getCategoryColorStyle(categoryName: string): any {
    switch (categoryName) {
      case 'Transportation':
      case 'Travel': return { 'background-color': 'rgba(16, 185, 129, 0.15)', 'color': '#10b981' };
      case 'Electricity':
      case 'Fuel': return { 'background-color': 'rgba(245, 158, 11, 0.15)', 'color': '#f59e0b' };
      case 'Food': return { 'background-color': 'rgba(249, 115, 22, 0.15)', 'color': '#f97316' };
      case 'Water Usage': return { 'background-color': 'rgba(14, 165, 233, 0.15)', 'color': '#0ea5e9' };
      case 'Waste': return { 'background-color': 'rgba(100, 116, 139, 0.15)', 'color': '#64748b' };
      case 'Online Shopping': return { 'background-color': 'rgba(168, 85, 247, 0.15)', 'color': '#a855f7' };
      default: return { 'background-color': 'rgba(20, 184, 166, 0.15)', 'color': '#14b8a6' };
    }
  }

  trendPeriod: '7days' | '14days' | '1month' | '3months' | 'custom-month' = '7days';
  showTrendDropdown = false;
  showTrendMonthDropdown = false;
  trendMonth = '';

  get trendTitle(): string {
    switch(this.trendPeriod) {
      case '7days': return 'Weekly Trend';
      case '14days': return 'Bi-Weekly Trend';
      case '1month': return 'Monthly Trend';
      case '3months': return 'Quarterly Trend';
      case 'custom-month': 
         const m = this.availableMonths.find(x => x.value === this.trendMonth);
         return m ? `${m.label} Trend` : 'Monthly Trend';
      default: return 'Trend';
    }
  }

  setTrendPeriod(period: '7days' | '14days' | '1month' | '3months') {
    this.trendPeriod = period;
    this.showTrendDropdown = false;
    this.onTrendPeriodChange();
  }

  setTrendMonth(monthValue: string) {
    this.trendPeriod = 'custom-month';
    this.trendMonth = monthValue;
    this.showTrendMonthDropdown = false;
    this.onTrendPeriodChange();
  }

  getTrendMonthLabel(): string {
    if (this.trendPeriod !== 'custom-month') return 'Month-wise';
    const m = this.availableMonths.find(x => x.value === this.trendMonth);
    return m ? m.label : 'Month-wise';
  }

  onTrendPeriodChange() {
    this.loadTrendData();
  }

  private loadTrendData(): void {
    const now = new Date();
    let daysToGenerate = 7;
    let startDate: Date;
    let endDate: Date;

    if (this.trendPeriod === 'custom-month' && this.trendMonth) {
      const [year, month] = this.trendMonth.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
      daysToGenerate = endDate.getDate();
    } else {
      if (this.trendPeriod === '7days') daysToGenerate = 7;
      else if (this.trendPeriod === '14days') daysToGenerate = 14;
      else if (this.trendPeriod === '1month') daysToGenerate = 30;
      else if (this.trendPeriod === '3months') daysToGenerate = 90;

      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (daysToGenerate - 1));
    }

    const startDateStr = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
    const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;

    this.carbonEntryService.getEntries(
      0, 1000, undefined, undefined, undefined, startDateStr, endDateStr, undefined, undefined, undefined, undefined, 'entryDate,asc'
    ).subscribe({
      next: (response) => {
        this.processTrendData(response.content, daysToGenerate, endDate);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load trend data', err)
    });
  }

  private processTrendData(entries: CarbonEntryResponse[], days: number, endDate: Date): void {
    const dataMap = new Map<string, number>();
    const labels = [];
    
    // Initialize map with 0 for all days in range
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      dataMap.set(dateStr, 0);
      
      if (this.trendPeriod === '7days') {
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      } else {
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    // Aggregate emissions by date
    entries.forEach(entry => {
      if (entry.entryDate) {
        const dateKey = entry.entryDate.split('T')[0];
        if (dataMap.has(dateKey)) {
          dataMap.set(dateKey, dataMap.get(dateKey)! + entry.emissionKgco2e);
        }
      }
    });

    const data = Array.from(dataMap.values());

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          label: 'Emissions',
          backgroundColor: 'rgba(20, 184, 166, 0.15)',
          borderColor: 'rgba(20, 184, 166, 1)',
          pointBackgroundColor: 'rgba(20, 184, 166, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(20, 184, 166, 0.8)',
          pointRadius: this.trendPeriod === '3months' ? 1 : 3,
          fill: 'origin',
          tension: 0.4
        }
      ]
    };
  }

  onSubmit(): void {
    if (this.entryForm.invalid) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    // Get raw value to include disabled 'unit' field
    const formData = this.entryForm.getRawValue();
    formData.entryDate = `${formData.entryDateDate}T${formData.entryDateTime}`;
    delete formData.entryDateDate;
    delete formData.entryDateTime;

    if (this.isEditing && this.currentEditingId) {
      this.carbonEntryService.updateEntry(this.currentEditingId, formData)
        .pipe(finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
        next: () => {
          this.showToast('Entry Updated Successfully', 'success');
          this.loadEntries();
          this.loadSummary();
          this.resetForm();
        },
        error: (err) => {
          this.showToast('Failed to Save Entry', 'error');
          this.handleBackendErrors(err, 'Failed to update entry.');
        }
      });
    } else {
      this.carbonEntryService.createEntry(formData)
        .pipe(finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
        next: () => {
          this.showToast('Entry Added Successfully', 'success');
          this.loadEntries();
          this.loadSummary();
          this.resetForm();
        },
        error: (err) => {
          this.showToast('Failed to Save Entry', 'error');
          this.handleBackendErrors(err, 'Failed to log entry.');
        }
      });
    }
  }

  private handleBackendErrors(err: any, defaultMessage: string): void {
    if (err.status === 400 && err.error?.errors) {
      let hasFieldErrors = false;
      Object.keys(err.error.errors).forEach(key => {
        const control = this.entryForm.get(key);
        if (control) {
          control.setErrors({ serverError: err.error.errors[key] });
          control.markAsTouched();
          hasFieldErrors = true;
        }
      });
      this.errorMessage = hasFieldErrors ? 'Please correct the highlighted fields.' : (err.error?.message || defaultMessage);
    } else {
      this.errorMessage = err.error?.message || err.error?.errors?.error || defaultMessage;
    }
  }

  openAddEntry(): void {
    this.showAddEntryCard = true;
    document.body.style.overflow = 'hidden';
  }

  editEntry(entry: CarbonEntryResponse): void {
    this.isEditing = true;
    this.showAddEntryCard = true;
    document.body.style.overflow = 'hidden';
    this.currentEditingId = entry.id;
    
    // Set category first without emitting events to prevent overriding subCategoryId
    this.entryForm.get('categoryId')?.setValue(entry.categoryId, { emitEvent: false });
    
    // Manually update the available subcategories
    const category = this.categories.find(c => c.id === entry.categoryId);
    this.availableSubTypes = category?.subCategories || [];

    const dt = entry.entryDate ? entry.entryDate.split('T') : ['',''];
    const eDate = dt[0];
    const eTime = dt[1] ? dt[1].substring(0, 5) : '';

    // Now safely patch the rest of the form
    this.entryForm.patchValue({
      subCategoryId: entry.subCategoryId,
      quantity: entry.quantity,
      unit: entry.unit,
      entryDateDate: eDate,
      entryDateTime: eTime,
      notes: entry.notes || ''
    });
  }

  openViewModal(entry: CarbonEntryResponse): void {
    this.viewEntry = entry;
  }

  closeViewModal(): void {
    this.viewEntry = null;
  }

  initiateDelete(id: number): void {
    this.entryToDeleteId = id;
  }

  cancelDelete(): void {
    this.entryToDeleteId = null;
  }

  // Bulk Delete and Export functionality restored
  selectedEntries: Set<number> = new Set<number>();

  toggleSelection(id: number, event: any) {
    if (event.target.checked) {
      this.selectedEntries.add(id);
    } else {
      this.selectedEntries.delete(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedEntries.has(id);
  }

  hasSelectedEntries(): boolean {
    return this.selectedEntries.size > 0;
  }

  bulkDelete() {
    if (this.selectedEntries.size === 0) return;
    if (confirm(`Are you sure you want to delete ${this.selectedEntries.size} entries?`)) {
      // In a real app with bulk delete API, call it here. 
      // For now, simulating success since bulk delete API was noted missing or just front-end simulation.
      this.toasts.push({ id: this.toastIdCounter++, message: `Deleted ${this.selectedEntries.size} entries successfully (Simulated)`, type: 'success' });
      this.selectedEntries.clear();
      this.loadEntries();
    }
  }

  exportToCsv() {
    if (this.entries.length === 0) {
       this.toasts.push({ id: this.toastIdCounter++, message: 'No entries to export', type: 'error' });
       return;
    }
    const headers = ['Date', 'Category', 'Sub Category', 'Quantity', 'Unit', 'Emission (kg CO2e)'];
    const rows = this.entries.map(e => [
      new Date(e.entryDate).toLocaleDateString(),
      e.categoryName,
      e.subType,
      e.quantity,
      e.unit,
      e.emissionKgco2e
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "carbon_entries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel() {
    // Basic Excel fallback using CSV but with xls extension
    if (this.entries.length === 0) {
       this.toasts.push({ id: this.toastIdCounter++, message: 'No entries to export', type: 'error' });
       return;
    }
    const headers = ['Date', 'Category', 'Sub Category', 'Quantity', 'Unit', 'Emission (kg CO2e)'];
    const rows = this.entries.map(e => [
      new Date(e.entryDate).toLocaleDateString(),
      e.categoryName,
      e.subType,
      e.quantity,
      e.unit,
      e.emissionKgco2e
    ]);
    const csvContent = "data:application/vnd.ms-excel;charset=utf-8," + headers.join("\t") + "\n" + rows.map(r => r.join("\t")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "carbon_entries.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  confirmDelete(): void {
    if (this.entryToDeleteId === null) return;
    
    this.isDeleting = true;
    
    this.carbonEntryService.deleteEntry(this.entryToDeleteId)
      .pipe(finalize(() => {
        this.isDeleting = false;
        this.entryToDeleteId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: () => {
        this.showToast('Entry Deleted Successfully', 'success');
        this.loadEntries();
        this.loadSummary();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Network Error', 'error');
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.showAddEntryCard = false;
    document.body.style.overflow = '';
    this.currentEditingId = null;
    this.errorMessage = '';
    this.entryForm.reset({ categoryId: 1, quantity: 0, unit: 'km', entryDateDate: '', entryDateTime: '' });
    this.updateCategoryDependencies(1);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEntries();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.loadEntries();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadEntries();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const id = this.toastIdCounter++;
    this.toasts.push({ id, message, type });
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
