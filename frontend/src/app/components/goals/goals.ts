import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { GoalResponse, GoalAnalyticsResponse, GoalType } from '../../models/goal.models';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSkeletonComponent, EmptyStateComponent],
  templateUrl: './goals.html',
  styleUrls: ['./goals.css']
})
export class GoalsComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  
  goals: GoalResponse[] = [];
  analytics: GoalAnalyticsResponse | null = null;
  goalAnalyticsMap: { [id: number]: GoalAnalyticsResponse } = {};
  activeFilter = 'ALL';

  // Modal State
  showCreateModal = false;
  isEditMode = false;
  selectedGoalId: number | null = null;
  
  globalStats = {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    automaticGoals: 0,
    manualGoals: 0,
    nearLimitGoals: 0,
    exceededGoals: 0,
    expiringSoonGoals: 0
  };
  overallHealth: string = 'Good';
  
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  
  showProgressModal = false;
  progressForm: FormGroup;
  
  showDeleteModal = false;
  goalToDelete: GoalResponse | null = null;
  
  showTimelineModal = false;
  timelineGoal: GoalResponse | null = null;
  isTimelineLoading = false;
  
  activeDropdownId: number | null = null;
  
  filteredGoals: GoalResponse[] = [];

  // Achievements Modal
  showAchievementsModal = false;
  achievements: GoalResponse[] = [];
  achievementAnalyticsMap: { [id: number]: GoalAnalyticsResponse } = {};
  isAchievementsLoading = false;
  
  get hasAutomaticGoals(): boolean {
    return this.filteredGoals.some(g => g.isAutomatic);
  }
  
  get hasManualGoals(): boolean {
    return this.filteredGoals.some(g => !g.isAutomatic);
  }
  
  get activeTips(): string[] {
    const autoGoal = this.filteredGoals.find(g => g.isAutomatic);
    if (autoGoal) {
      return this.getSmartTips(autoGoal);
    }
    return ['Track your progress regularly', 'Set realistic limits', 'Stay consistent'];
  }
  
  isSubmitting = false;
  createForm: FormGroup;
  modalErrorMessage = '';
  GoalTypes = [
    { value: 'REDUCE_CARBON_EMISSIONS', label: 'Reduce Carbon Emissions', category: 'Carbon Budget', unit: 'kg CO2e', icon: 'activity', desc: 'Monitor your total emissions and stay below your personal limit.' },
    { value: 'REDUCE_WATER_USAGE', label: 'Reduce Water Usage', category: 'Water Budget', unit: 'litres', icon: 'droplets', desc: 'Monitor your daily water consumption and stay below your personal limit.' },
    { value: 'REDUCE_ELECTRICITY_CONSUMPTION', label: 'Reduce Electricity Consumption', category: 'Electricity Budget', unit: 'kWh', icon: 'zap', desc: 'Track household electricity usage.' },
    { value: 'USE_PUBLIC_TRANSPORT', label: 'Use Public Transport', category: 'Transport Budget', unit: 'km', icon: 'car', desc: 'Track transport emissions and stay below limit.' },
    { value: 'INCREASE_RECYCLING', label: 'Increase Recycling', category: 'Waste Budget', unit: 'kg', icon: 'trash-2', desc: 'Monitor waste generation.' },
    { value: 'REDUCE_PLASTIC_USAGE', label: 'Reduce Plastic Usage', category: 'Waste Budget', unit: 'items', icon: 'trash-2', desc: 'Monitor your plastic waste generation.' },
    { value: 'PLANT_TREES', label: 'Plant Trees', category: 'Nature', unit: 'trees', icon: 'sprout', desc: 'Contribute to planting trees (Achievement).' }
  ];

  constructor(
    private goalService: GoalService, 
    private fb: FormBuilder, 
    private sanitizer: DomSanitizer
  ) {
    this.createForm = this.fb.group({
      goalType: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      targetValue: ['', [Validators.required, Validators.min(0.000001)]],
      unit: [{value: '', disabled: true}, [Validators.required]],
      targetDate: ['', [Validators.required, this.futureDateValidator]]
    });
    
    this.progressForm = this.fb.group({
      progressValue: ['', [Validators.required, Validators.min(0.000001)]],
      notes: ['', [Validators.maxLength(255)]]
    });

    this.createForm.get('goalType')?.valueChanges.subscribe(type => {
      const found = this.GoalTypes.find(g => g.value === type);
      if (found && !this.isEditMode) {
        this.createForm.patchValue({
          title: found.label,
          description: found.desc,
          unit: this.getUnitForType(type)
        });
      } else if (found && this.isEditMode) {
        this.createForm.patchValue({
          unit: this.getUnitForType(type)
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.activeDropdownId = null;
    }
  }

  toggleDropdown(event: Event, goalId: number) {
    event.stopPropagation();
    if (this.activeDropdownId === goalId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = goalId;
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.goals];
    
    // Sort logic
    if (this.activeSort === 'NEWEST') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.activeSort === 'OLDEST') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.activeSort === 'HIGHEST_PROGRESS') {
      filtered.sort((a, b) => this.getProgressPercentage(b.currentValue, b.targetValue) - this.getProgressPercentage(a.currentValue, a.targetValue));
    } else if (this.activeSort === 'LEAST_PROGRESS') {
      filtered.sort((a, b) => this.getProgressPercentage(a.currentValue, a.targetValue) - this.getProgressPercentage(b.currentValue, b.targetValue));
    } else if (this.activeSort === 'CLOSEST_LIMIT') {
      filtered.sort((a, b) => {
        const diffA = a.targetValue - a.currentValue;
        const diffB = b.targetValue - b.currentValue;
        return diffA - diffB;
      });
    } else if (this.activeSort === 'ALPHABETICAL') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // Filter logic
    if (this.activeFilter === 'ALL') {
      this.filteredGoals = filtered;
    } else if (this.activeFilter === 'AUTOMATIC') {
      this.filteredGoals = filtered.filter(g => g.isAutomatic);
    } else if (this.activeFilter === 'MANUAL') {
      this.filteredGoals = filtered.filter(g => !g.isAutomatic);
    } else if (this.activeFilter === 'HEALTHY') {
      this.filteredGoals = filtered.filter(g => this.getComputedStatus(g) === 'WITHIN_BUDGET');
    } else if (this.activeFilter === 'NEAR_LIMIT') {
      this.filteredGoals = filtered.filter(g => this.getComputedStatus(g) === 'NEAR_LIMIT');
    } else if (this.activeFilter === 'EXCEEDED') {
      this.filteredGoals = filtered.filter(g => this.getComputedStatus(g) === 'EXCEEDED');
    } else if (this.activeFilter === 'COMPLETED') {
      this.filteredGoals = filtered.filter(g => !g.isAutomatic && ((g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED'));
    } else if (this.activeFilter === 'ARCHIVED') {
      this.filteredGoals = filtered.filter(g => (g.status as string) === 'ABANDONED' || (g.status as string) === 'ARCHIVED');
    } else {
      this.filteredGoals = filtered.filter(g => g.status === this.activeFilter);
    }
    
    this.totalElements = this.filteredGoals.length;
    
    // Check if currentPage is out of bounds after filtering
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    
    // Paginate
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.filteredGoals = this.filteredGoals.slice(start, end);
  }

  activeSort = 'NEWEST';
  setSort(sort: string) {
    this.activeSort = sort;
    this.applyFilter();
  }
  
  onSortChange(event: any) {
    this.setSort(event.target.value);
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      return { futureDate: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadData();

    this.createForm.get('goalType')?.valueChanges.subscribe(val => {
      if (val && !this.isEditMode) {
        const selected = this.GoalTypes.find(g => g.value === val);
        if (selected) {
           this.createForm.patchValue({
             unit: selected.unit,
             title: selected.label
           });
        }
      } else if (val && this.isEditMode) {
        const selected = this.GoalTypes.find(g => g.value === val);
        if (selected) {
           this.createForm.patchValue({
             unit: selected.unit
           });
        }
      }
    });
  }

  // Icon fetching is now strictly inline SVGs within HTML via ngSwitch for dynamic content

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      analytics: this.selectedGoalId ? this.goalService.getAnalytics(this.selectedGoalId).pipe(
        catchError(err => {
          console.error('Error fetching analytics:', err);
          return of(null);
        })
      ) : of(null),
      goalsData: this.goalService.getGoals(0, 1000).pipe(
        catchError(err => {
          console.error('Error fetching goals:', err);
          return of(null);
        })
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        this.analytics = results.analytics;
        if (results.goalsData) {
          this.goals = results.goalsData.content;
          this.totalElements = results.goalsData.totalElements;
          this.applyFilter();
          
          
          this.globalStats = {
            totalGoals: this.totalElements,
            activeGoals: this.goals.filter(g => g.status === 'ACTIVE').length,
            completedGoals: this.goals.filter(g => !g.isAutomatic && ((g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED')).length,
            automaticGoals: this.goals.filter(g => g.isAutomatic).length,
            manualGoals: this.goals.filter(g => !g.isAutomatic).length,
            nearLimitGoals: this.goals.filter(g => this.getComputedStatus(g) === 'NEAR_LIMIT').length,
            exceededGoals: this.goals.filter(g => this.getComputedStatus(g) === 'EXCEEDED').length,
            expiringSoonGoals: this.goals.filter(g => {
               const diffTime = Math.abs(new Date(g.targetDate).getTime() - new Date().getTime());
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               return diffDays <= 7 && (g.status as string) !== 'ACHIEVED' && (g.status as string) !== 'COMPLETED';
            }).length
          };
          this.calculateOverallHealth();
          
          // Fetch analytics for visible goals
          this.goals.forEach(goal => {
            this.goalService.getAnalytics(goal.id).subscribe({
              next: (data) => {
                this.goalAnalyticsMap[goal.id] = data;
              },
              error: (err) => {
                console.error(`Failed to fetch analytics for goal ${goal.id}`, err);
              }
            });
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load goals data. Please try again later.';
      }
    });
  }



  getProgressPercentage(current: number, target: number): number {
    if (!target || target <= 0) return 0;
    const percentage = (current / target) * 100;
    return percentage > 100 ? 100 : Math.round(percentage);
  }

  getAverageProgress(): number {
    if (this.goals.length === 0) return 0;
    const totalProgress = this.goals.reduce((acc, goal) => {
      return acc + this.getProgressPercentage(goal.currentValue, goal.targetValue);
    }, 0);
    return Math.round(totalProgress / this.goals.length);
  }

  getComputedStatus(goal: GoalResponse): string {
    const s = goal.status as string;
    if (s === 'ABANDONED' || s === 'ARCHIVED') return 'ARCHIVED';
    if (s === 'PAUSED') return 'PAUSED';
    if (s === 'ACHIEVED' || s === 'COMPLETED') return 'COMPLETED';
    if (!goal.isAutomatic) return goal.status;
    const limit = goal.targetValue;
    const current = goal.currentValue;
    if (current >= limit) return 'EXCEEDED';
    if (current >= limit * 0.75) return 'NEAR_LIMIT';
    return 'WITHIN_BUDGET';
  }

  calculateOverallHealth() {
    const autoGoals = this.globalStats.automaticGoals;
    if (autoGoals === 0) {
       this.overallHealth = 'Good';
       return;
    }
    const healthy = autoGoals - (this.globalStats.nearLimitGoals + this.globalStats.exceededGoals);
    const healthRatio = healthy / autoGoals;
    if (healthRatio >= 0.8) this.overallHealth = 'Excellent';
    else if (healthRatio >= 0.5) this.overallHealth = 'Good';
    else if (healthRatio >= 0.2) this.overallHealth = 'Needs Attention';
    else this.overallHealth = 'Critical';
  }

  getStatusIcon(status: string): string {
    if (status === 'ON_TRACK') return '🟢';
    if (status === 'NEAR_LIMIT') return '🟡';
    if (status === 'LIMIT_EXCEEDED') return '🔴';
    return '';
  }
  
  getGoalInsight(goal: GoalResponse): string {
    if (!goal.isAutomatic) return '';
    const percentage = this.getProgressPercentage(goal.currentValue, goal.targetValue);
    if (percentage >= 100) return 'Budget limit reached or exceeded.';
    if (percentage >= 75) return "You're nearing your budget limit.";
    if (percentage >= 50) return "Usage is increasing faster than expected.";
    
    return "Great! You're using resources efficiently.";
  }
  
  getGoalCategory(type: string): string {
    const found = this.GoalTypes.find(g => g.value === type);
    return found ? found.category : 'Goal';
  }

  getGoalIconName(type: string): string {
    const found = this.GoalTypes.find(g => g.value === type);
    return found ? found.icon : 'target';
  }
  


  getGoalDesc(type: string): string {
    const found = this.GoalTypes.find(g => g.value === type);
    return found ? found.desc : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EXCEEDED': return 'text-danger border-danger-subtle bg-danger-subtle';
      case 'NEAR_LIMIT': return 'text-warning border-warning-subtle bg-warning-subtle';
      case 'WITHIN_BUDGET': return 'text-success border-success-subtle bg-success-subtle';
      case 'COMPLETED':
      case 'ACHIEVED': return 'text-success border-success-subtle bg-success-subtle';
      case 'ACTIVE': return 'text-primary border-primary-subtle bg-primary-subtle';
      default: return 'text-secondary border-secondary-subtle bg-secondary-subtle';
    }
  }



  getUnitForType(type: string): string {
    const found = this.GoalTypes.find(g => g.value === type);
    if (!found) return '';
    if (type === 'REDUCE_WATER_USAGE') return 'litres';
    if (type === 'REDUCE_ELECTRICITY_CONSUMPTION') return 'kWh';
    if (type === 'REDUCE_FUEL_USAGE') return 'litres';
    if (type === 'USE_PUBLIC_TRANSPORT') return 'km';
    if (type === 'REDUCE_CARBON_EMISSIONS') return 'kg CO₂e';
    if (type === 'INCREASE_RECYCLING') return 'kg';
    if (type === 'PLANT_TREES') return 'trees';
    if (type === 'REDUCE_PLASTIC_USAGE') return 'items';
    if (type === 'SWITCH_TO_RENEWABLE_ENERGY') return '%';
    if (type === 'REDUCE_MEAT_CONSUMPTION') return 'meals';
    return '';
  }

  getAveragePerDay(goal: GoalResponse): string {
    const start = new Date(goal.createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
    const avg = goal.currentValue / diffDays;
    return avg.toFixed(1);
  }

  getForecast(goal: GoalResponse): { usage: string, status: string, available: boolean } {
    if (goal.currentValue >= goal.targetValue) {
      return {
        usage: goal.currentValue.toFixed(1) + ' / ' + goal.targetValue + ' ' + goal.unit,
        status: 'Limit Reached',
        available: true
      };
    }
    const avg = parseFloat(this.getAveragePerDay(goal));
    if (avg === 0 || isNaN(avg)) {
      return { usage: 'Forecast unavailable', status: 'Unknown', available: false };
    }
    const remainingDays = Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const forecastedUsage = goal.currentValue + (avg * remainingDays);
    return {
      usage: forecastedUsage.toFixed(1) + ' / ' + goal.targetValue + ' ' + goal.unit,
      status: forecastedUsage > goal.targetValue ? 'High Risk' : 'Safe',
      available: true
    };
  }

  getSmartTips(goal: GoalResponse): string[] {
    switch (goal.goalType) {
      case 'REDUCE_WATER_USAGE':
        return ['Take shorter showers', 'Fix leaks', 'Turn off taps'];
      case 'REDUCE_ELECTRICITY_CONSUMPTION':
        return ['Switch off standby devices', 'Use LED bulbs', 'Maximize natural light'];
      case 'USE_PUBLIC_TRANSPORT':
        return ['Use public transport', 'Carpool', 'Walk'];
      case 'INCREASE_RECYCLING':
      case 'REDUCE_PLASTIC_USAGE':
        return ['Recycle', 'Avoid plastic', 'Separate waste'];
      case 'REDUCE_CARBON_EMISSIONS':
        return ['Use public transport', 'Eat less meat', 'Reduce energy usage'];
      case 'PLANT_TREES':
        return ['Plant native trees', 'Track survival', 'Join community planting'];
      default:
        return ['Track your progress regularly', 'Set realistic limits', 'Stay consistent'];
    }
  }

  getProgressBarClass(goal: GoalResponse): string {
    if (!goal.isAutomatic) {
      return 'bg-primary';
    }
    const p = this.getProgressPercentage(goal.currentValue, goal.targetValue);
    if (p <= 70) return 'bg-success';
    if (p <= 90) return 'bg-warning';
    if (p <= 100) return 'bg-danger';
    return 'bg-danger bg-opacity-75'; // Dark red for >100%
  }

  getDaysRemaining(goal: GoalResponse): number {
    const end = new Date(goal.targetDate).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  getEstimatedCompletion(goal: GoalResponse): string {
    const analytics = this.goalAnalyticsMap[goal.id];
    if (analytics && analytics.projectedCompletionDate) {
      const diff = new Date(analytics.projectedCompletionDate).getTime() - new Date().getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} Days` : 'Soon';
    }
    return 'N/A';
  }

  getSparkline(goal: GoalResponse): SafeHtml {
    const analytics = this.goalAnalyticsMap[goal.id];
    if (!analytics || !analytics.history || analytics.history.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(`<span class="text-muted fs-8">No trend available</span>`);
    }

    const history = analytics.history;
    // We only use up to 10 points
    const pointsData = history.slice(-10).map(h => h.currentProgress);
    if (pointsData.length < 2) {
      return this.sanitizer.bypassSecurityTrustHtml(`<span class="text-muted fs-8">No trend available</span>`);
    }

    const maxProgress = Math.max(...pointsData, goal.targetValue);
    
    // Create polyline SVG
    const width = 80;
    const height = 30;
    const stepX = width / (pointsData.length - 1);
    
    const points = pointsData.map((val, idx) => {
      const x = idx * stepX;
      // y is inverted, height - scaled height
      const y = height - (val / maxProgress * height);
      return `${x},${y}`;
    });

    const color = goal.isAutomatic ? '#10b981' : '#3b82f6';
    
    const svg = `<svg width="80" height="30" viewBox="0 0 80 30" style="overflow: visible;">
      <polyline fill="none" stroke="${color}" stroke-width="2" points="${points.join(' ')}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedGoalId = null;
    this.showCreateModal = true;
    this.modalErrorMessage = '';
    this.createForm.reset();
    document.body.style.overflow = 'hidden';
  }

  openEditModal(goal: GoalResponse): void {
    this.activeDropdownId = null;
    this.isEditMode = true;
    this.selectedGoalId = goal.id;
    this.showCreateModal = true;
    this.modalErrorMessage = '';
    
    const tDate = goal.targetDate ? goal.targetDate.split('T')[0] : '';
    
    this.createForm.patchValue({
      goalType: goal.goalType || '',
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue,
      unit: goal.unit,
      targetDate: tDate
    }, { emitEvent: true });
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    document.body.style.overflow = '';
  }

  submitCreateGoal(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    this.modalErrorMessage = '';
    
    const request$ = this.isEditMode && this.selectedGoalId
      ? this.goalService.updateGoal(this.selectedGoalId, this.createForm.getRawValue())
      : this.goalService.createGoal(this.createForm.getRawValue());
    
    request$
      .pipe(finalize(() => {
        this.isSubmitting = false;
      }))
      .subscribe({
        next: () => {
          this.closeCreateModal();
          this.successMessage = this.isEditMode ? 'Goal updated successfully!' : 'Goal created successfully!';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} goal. Please verify your inputs.`;
        }
      });
  }

  openProgressModal(goal: GoalResponse): void {
    this.activeDropdownId = null;
    this.selectedGoalId = goal.id;
    this.showProgressModal = true;
    this.modalErrorMessage = '';
    this.progressForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
    this.selectedGoalId = null;
    document.body.style.overflow = '';
  }

  submitProgress(): void {
    if (this.progressForm.invalid || !this.selectedGoalId) {
      this.progressForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.modalErrorMessage = '';
    this.goalService.addProgress(this.selectedGoalId, this.progressForm.value)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.closeProgressModal();
          this.successMessage = 'Progress updated successfully!';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage = err.error?.message || 'Failed to update progress.';
        }
      });
  }

  confirmDelete(goal: GoalResponse): void {
    this.activeDropdownId = null;
    this.goalToDelete = goal;
    this.showDeleteModal = true;
    this.modalErrorMessage = '';
    document.body.style.overflow = 'hidden';
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.goalToDelete = null;
    document.body.style.overflow = '';
  }

  deleteGoal(): void {
    if (!this.goalToDelete) return;
    this.isSubmitting = true;
    this.modalErrorMessage = '';
    
    this.goalService.deleteGoal(this.goalToDelete.id)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.cancelDelete();
          this.successMessage = 'Goal deleted successfully!';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage = err.error?.message || 'Failed to delete goal.';
        }
      });
  }

  groupedTimeline: { label: string, items: any[] }[] = [];

  openTimelineModal(goal: GoalResponse): void {
    this.activeDropdownId = null;
    this.timelineGoal = goal;
    this.showTimelineModal = true;
    this.isTimelineLoading = true;
    
    this.goalService.getAnalytics(goal.id).pipe(
      finalize(() => this.isTimelineLoading = false)
    ).subscribe({
      next: (data) => {
        this.analytics = data;
        this.groupTimelineItems(data.history || []);
      },
      error: (err) => {
        console.error('Failed to fetch analytics', err);
        this.analytics = null;
        this.groupedTimeline = [];
      }
    });
    
    document.body.style.overflow = 'hidden';
  }

  groupTimelineItems(history: any[]): void {
    this.groupedTimeline = [];
    if (!history || history.length === 0) return;

    const todayItems: any[] = [];
    const yesterdayItems: any[] = [];
    const earlierItems: any[] = [];

    const now = new Date();
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStr = todayStr - (1000 * 60 * 60 * 24);

    history.forEach(item => {
      const d = new Date(item.timestamp).getTime();
      if (d >= todayStr) {
        todayItems.push(item);
      } else if (d >= yesterdayStr) {
        yesterdayItems.push(item);
      } else {
        earlierItems.push(item);
      }
    });

    if (todayItems.length > 0) this.groupedTimeline.push({ label: 'Today', items: todayItems });
    if (yesterdayItems.length > 0) this.groupedTimeline.push({ label: 'Yesterday', items: yesterdayItems });
    if (earlierItems.length > 0) this.groupedTimeline.push({ label: 'Earlier', items: earlierItems });
  }

  closeTimelineModal(): void {
    this.showTimelineModal = false;
    this.timelineGoal = null;
    this.analytics = null;
    document.body.style.overflow = '';
  }

  openAchievementsModal(): void {
    this.showAchievementsModal = true;
    this.isAchievementsLoading = true;
    this.achievementAnalyticsMap = {};
    document.body.style.overflow = 'hidden';

    // Achievements = completed manual goals + within-budget automatic goals
    this.achievements = this.goals.filter(g => {
      if (!g.isAutomatic) {
        return (g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED';
      } else {
        return g.currentValue <= g.targetValue;
      }
    });

    // Fetch analytics/history for each achievement
    if (this.achievements.length === 0) {
      this.isAchievementsLoading = false;
      return;
    }

    let loaded = 0;
    this.achievements.forEach(goal => {
      this.goalService.getAnalytics(goal.id).subscribe({
        next: (data) => {
          this.achievementAnalyticsMap[goal.id] = data;
          loaded++;
          if (loaded >= this.achievements.length) {
            this.isAchievementsLoading = false;
          }
        },
        error: () => {
          loaded++;
          if (loaded >= this.achievements.length) {
            this.isAchievementsLoading = false;
          }
        }
      });
    });
  }

  closeAchievementsModal(): void {
    this.showAchievementsModal = false;
    this.achievements = [];
    this.achievementAnalyticsMap = {};
    document.body.style.overflow = '';
  }

  getAchievementLabel(goal: GoalResponse): string {
    if (!goal.isAutomatic) {
      return 'Goal Completed';
    }
    const pct = this.getProgressPercentage(goal.currentValue, goal.targetValue);
    if (pct <= 50) return 'Well Under Budget';
    if (pct <= 75) return 'Within Budget';
    return 'Budget Maintained';
  }

  getAchievementBadgeClass(goal: GoalResponse): string {
    if (!goal.isAutomatic) {
      return 'bg-success-subtle text-success border-success-subtle';
    }
    const pct = this.getProgressPercentage(goal.currentValue, goal.targetValue);
    if (pct <= 50) return 'bg-success-subtle text-success border-success-subtle';
    if (pct <= 75) return 'bg-primary-subtle text-primary border-primary-subtle';
    return 'bg-warning-subtle text-warning border-warning-subtle';
  }

  getManualAchievementsCount(): number {
    return this.achievements.filter(g => !g.isAutomatic).length;
  }

  getAutoAchievementsCount(): number {
    return this.achievements.filter(g => g.isAutomatic).length;
  }

  // Pagination methods
  get Math() {
    return Math;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 0;
    this.loadData();
  }
}
