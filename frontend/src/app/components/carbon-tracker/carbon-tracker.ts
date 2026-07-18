import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CarbonEntryService } from '../../services/carbon-entry.service';
import { CarbonEntryResponse, CarbonSummaryResponse } from '../../models/carbon.models';
import { finalize } from 'rxjs/operators';
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
  imports: [CommonModule, ReactiveFormsModule, LoadingSkeletonComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './carbon-tracker.html',
  styleUrls: ['./carbon-tracker.css'],
})
export class CarbonTrackerComponent implements OnInit {
  entries: CarbonEntryResponse[] = [];
  summary: CarbonSummaryResponse | null = null;
  
  entryForm: FormGroup;
  isEditing = false;
  currentEditingId: number | null = null;
  pendingDeleteId: number | null = null;
  
  errorMessage = '';
  isSubmitting = false;
  
  showAddEntryCard = false;

  // Modals & Toasts
  viewEntry: CarbonEntryResponse | null = null;
  entryToDeleteId: number | null = null;
  isDeleting = false;

  toasts: { id: number, message: string, type: 'success' | 'error' }[] = [];
  private toastIdCounter = 0;

  // State
  loadError = false;

  highestCategory: string | null = null;
  carbonSources: { name: string, percentage: number, value: number, color: string }[] = [];

  // Charts
  public lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { display: false }, x: { display: false } },
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

  categories = [
    { id: 1, name: 'Transportation', unit: 'km', subTypes: ['Car', 'Bus', 'Train', 'Flights'] },
    { id: 2, name: 'Electricity', unit: 'kWh', subTypes: ['Grid Electricity'] },
    { id: 3, name: 'Fuel', unit: 'litres', subTypes: ['Petrol', 'Diesel', 'Natural Gas'] },
    { id: 4, name: 'Food', unit: 'kg', subTypes: ['Beef', 'Chicken', 'Vegan'] },
    { id: 5, name: 'Waste', unit: 'kg', subTypes: ['Landfill', 'Recycled'] },
    { id: 6, name: 'Water Usage', unit: 'litres', subTypes: ['Tap', 'Bottled'] },
    { id: 7, name: 'Online Shopping', unit: 'items', subTypes: ['Electronics', 'Clothing'] },
    { id: 8, name: 'Travel', unit: 'nights', subTypes: ['Hotel Stays', 'Cruises'] }
  ];

  availableSubTypes: string[] = [];

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
      categoryId: [1, Validators.required],
      subType: ['', [Validators.required, Validators.maxLength(100)]],
      quantity: [0, [Validators.required, Validators.min(0.0001)]],
      unit: [{value: 'km', disabled: true}, [Validators.required, Validators.maxLength(30)]],
      entryDate: ['', [Validators.required, pastOrPresentValidator]],
      notes: ['', [Validators.maxLength(500)]]
    });

    this.entryForm.get('categoryId')?.valueChanges.subscribe(catId => {
      this.updateCategoryDependencies(Number(catId));
    });
  }

  updateCategoryDependencies(catId: number): void {
    const category = this.categories.find(c => c.id === catId);
    if (category) {
      this.availableSubTypes = category.subTypes;
      this.entryForm.patchValue({
        subType: this.availableSubTypes.length > 0 ? this.availableSubTypes[0] : '',
        unit: category.unit
      });
    }
  }

  ngOnInit(): void {
    this.loadEntries();
    this.loadSummary();
  }

  loadEntries(): void {
    this.isLoading = true;
    this.loadError = false;
    this.carbonEntryService.getEntries(this.currentPage, this.pageSize)
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
        this.processCarbonSources(summary.categorySummaries);
      },
      error: (err) => console.error('Failed to load summary', err)
    });
  }

  private processCarbonSources(categorySummaries: any[] | undefined): void {
    if (!categorySummaries || categorySummaries.length === 0) return;
    
    const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#94a3b8', '#f59e0b'];
    
    this.carbonSources = categorySummaries
      .map((s, i) => ({
        name: s.categoryName,
        value: s.totalEmission,
        percentage: s.percentage,
        color: colors[i % colors.length]
      }))
      .sort((a,b) => b.percentage - a.percentage);
      
    if (this.carbonSources.length > 0) {
      this.highestCategory = this.carbonSources[0].name;
    }

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

  onSubmit(): void {
    if (this.entryForm.invalid) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    // Get raw value to include disabled 'unit' field
    const formData = this.entryForm.getRawValue();

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

  editEntry(entry: CarbonEntryResponse): void {
    this.isEditing = true;
    this.showAddEntryCard = true;
    this.currentEditingId = entry.id;
    this.updateCategoryDependencies(entry.categoryId);
    this.entryForm.patchValue({
      categoryId: entry.categoryId,
      subType: entry.subType,
      quantity: entry.quantity,
      unit: entry.unit,
      entryDate: entry.entryDate,
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
    this.currentEditingId = null;
    this.errorMessage = '';
    this.entryForm.reset({ categoryId: 1, quantity: 0, unit: 'km' });
    this.updateCategoryDependencies(1);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEntries();
    }
  }

  changePageSize(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
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
