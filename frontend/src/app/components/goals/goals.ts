import { Component, OnInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import {
  GoalResponse,
  GoalAnalyticsResponse,
  GoalType,
  GoalOptimizationResponse,
} from '../../models/goal.models';
import { LoadingSkeletonComponent } from '../../shared/ui/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    RouterModule,
  ],
  templateUrl: './goals.html',
  styleUrls: ['./goals.css'],
})
export class GoalsComponent implements OnInit {
  isLoading = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  goals = signal<GoalResponse[]>([]);
  analytics = signal<GoalAnalyticsResponse | null>(null);
  goalAnalyticsMap = signal<{ [id: number]: GoalAnalyticsResponse }>({});
  activeFilter = signal('ALL');

  // Modal State
  showCreateModal = signal(false);
  isEditMode = signal(false);
  selectedGoalId = signal<number | null>(null);

  globalStats = signal({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    automaticGoals: 0,
    manualGoals: 0,
    nearLimitGoals: 0,
    exceededGoals: 0,
    expiringSoonGoals: 0,
    completedBudgets: 0,
  });
  overallHealth = signal<string>('Good');

  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  showProgressModal = signal(false);
  progressForm: FormGroup;

  showDeleteModal = signal(false);
  goalToDelete = signal<GoalResponse | null>(null);

  showTimelineModal = signal(false);
  timelineGoal = signal<GoalResponse | null>(null);
  isTimelineLoading = signal(false);
  timelinePage = signal(1);
  timelinePageSize = 10;

  activeDropdownId = signal<number | null>(null);

  filteredGoals = signal<GoalResponse[]>([]);

  // Achievements Modal
  showAchievementsModal = signal(false);
  achievements = signal<GoalResponse[]>([]);
  achievementAnalyticsMap = signal<{ [id: number]: GoalAnalyticsResponse }>({});
  isAchievementsLoading = signal(false);
  expandedAchievementId = signal<number | null>(null);
  achievementsPage = signal(0);
  achievementsPageSize = signal(5);

  achievementsPageStart = computed(() => {
    return this.achievementsPage() * this.achievementsPageSize();
  });

  achievementsPageEnd = computed(() => {
    return Math.min(
      this.achievementsPageStart() + this.achievementsPageSize(),
      this.achievements().length,
    );
  });

  paginatedAchievements = computed(() => {
    return this.achievements().slice(this.achievementsPageStart(), this.achievementsPageEnd());
  });

  hasAutomaticGoals = computed(() => {
    return this.filteredGoals().some((g) => g.isAutomatic);
  });

  hasManualGoals = computed(() => {
    return this.filteredGoals().some((g) => !g.isAutomatic);
  });

  activeTips = computed(() => {
    const autoGoal = this.filteredGoals().find((g) => g.isAutomatic);
    if (autoGoal) {
      return this.getSmartTips(autoGoal);
    }
    return ['Track your progress regularly', 'Set realistic limits', 'Stay consistent'];
  });

  isSubmitting = signal(false);
  isOptimizing = signal(false);
  aiOptimization = signal<GoalOptimizationResponse | null>(null);
  createForm: FormGroup;
  modalErrorMessage = signal('');
  GoalTypes = [
    {
      value: 'REDUCE_CARBON_EMISSIONS',
      label: 'Reduce Carbon Emissions',
      category: 'Carbon Budget',
      unit: 'kg CO2e',
      icon: 'activity',
      desc: 'Monitor your total emissions and stay below your personal limit.',
    },
    {
      value: 'REDUCE_WATER_USAGE',
      label: 'Reduce Water Usage',
      category: 'Water Budget',
      unit: 'litres',
      icon: 'droplets',
      desc: 'Monitor your daily water consumption and stay below your personal limit.',
    },
    {
      value: 'REDUCE_ELECTRICITY_CONSUMPTION',
      label: 'Reduce Electricity Consumption',
      category: 'Electricity Budget',
      unit: 'kWh',
      icon: 'zap',
      desc: 'Track household electricity usage.',
    },
    {
      value: 'USE_PUBLIC_TRANSPORT',
      label: 'Use Public Transport',
      category: 'Transport Budget',
      unit: 'km',
      icon: 'car',
      desc: 'Track transport emissions and stay below limit.',
    },
    {
      value: 'INCREASE_RECYCLING',
      label: 'Increase Recycling',
      category: 'Waste Budget',
      unit: 'kg',
      icon: 'trash-2',
      desc: 'Monitor waste generation.',
    },
    {
      value: 'REDUCE_PLASTIC_USAGE',
      label: 'Reduce Plastic Usage',
      category: 'Waste Budget',
      unit: 'items',
      icon: 'trash-2',
      desc: 'Monitor your plastic waste generation.',
    },
    {
      value: 'PLANT_TREES',
      label: 'Plant Trees',
      category: 'Nature',
      unit: 'trees',
      icon: 'sprout',
      desc: 'Contribute to planting trees (Achievement).',
    },
  ];

  constructor(
    private goalService: GoalService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,

    private router: Router,
  ) {
    this.createForm = this.fb.group({
      goalType: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      targetValue: ['', [Validators.required, Validators.min(0.000001)]],
      unit: [{ value: '', disabled: true }, [Validators.required]],
      targetDate: ['', [Validators.required, this.futureDateValidator]],
    });

    this.progressForm = this.fb.group({
      progressValue: ['', [Validators.required, Validators.min(0.000001)]],
      notes: ['', [Validators.maxLength(255)]],
    });

    this.createForm.get('goalType')?.valueChanges.subscribe((type) => {
      const found = this.GoalTypes.find((g) => g.value === type);
      if (found && !this.isEditMode()) {
        this.createForm.patchValue({
          title: found.label,
          description: found.desc,
          unit: this.getUnitForType(type),
        });
      } else if (found && this.isEditMode()) {
        this.createForm.patchValue({
          unit: this.getUnitForType(type),
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.activeDropdownId.set(null);
    }
    if (!target.closest('.custom-select-wrapper')) {
      this.isGoalTypeDropdownOpen.set(false);
    }
  }

  isGoalTypeDropdownOpen = signal(false);

  toggleGoalTypeDropdown(event: Event) {
    event.stopPropagation();
    this.isGoalTypeDropdownOpen.set(!this.isGoalTypeDropdownOpen());
  }

  selectGoalType(typeValue: string) {
    this.createForm.patchValue({ goalType: typeValue });
    this.createForm.get('goalType')?.markAsTouched();
    this.isGoalTypeDropdownOpen.set(false);
  }

  getSelectedGoalType(): any {
    const val = this.createForm.get('goalType')?.value;
    return this.GoalTypes.find((g) => g.value === val) || null;
  }

  toggleDropdown(event: Event, goalId: number) {
    event.stopPropagation();
    if (this.activeDropdownId() === goalId) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(goalId);
    }
  }

  searchQuery = signal('');

  onSearchChange(event: any) {
    this.searchQuery.set(event.target.value.toLowerCase());
    this.currentPage.set(0); // reset to first page on search
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.goals()];

    // Search logic (by title or goalType)
    if (this.searchQuery()) {
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(this.searchQuery()) ||
          g.goalType.toLowerCase().replace(/_/g, ' ').includes(this.searchQuery())
      );
    }

    // Sort logic
    if (this.activeSort() === 'NEWEST') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.activeSort() === 'OLDEST') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.activeSort() === 'HIGHEST_PROGRESS') {
      filtered.sort(
        (a, b) =>
          this.getProgressPercentage(b.currentValue, b.targetValue) -
          this.getProgressPercentage(a.currentValue, a.targetValue)
      );
    } else if (this.activeSort() === 'LEAST_PROGRESS') {
      filtered.sort(
        (a, b) =>
          this.getProgressPercentage(a.currentValue, a.targetValue) -
          this.getProgressPercentage(b.currentValue, b.targetValue)
      );
    } else if (this.activeSort() === 'CLOSEST_LIMIT') {
      filtered.sort((a, b) => {
        const diffA = a.targetValue - a.currentValue;
        const diffB = b.targetValue - b.currentValue;
        return diffA - diffB;
      });
    } else if (this.activeSort() === 'ALPHABETICAL') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Filter logic
    if (this.activeFilter() === 'ALL') {
      this.filteredGoals.set(filtered);
    } else if (this.activeFilter() === 'AUTOMATIC') {
      this.filteredGoals.set(filtered.filter((g) => g.isAutomatic));
    } else if (this.activeFilter() === 'MANUAL') {
      this.filteredGoals.set(filtered.filter((g) => !g.isAutomatic));
    } else if (this.activeFilter() === 'HEALTHY') {
      this.filteredGoals.set(filtered.filter((g) => this.getComputedStatus(g) === 'WITHIN_BUDGET'));
    } else if (this.activeFilter() === 'NEAR_LIMIT') {
      this.filteredGoals.set(filtered.filter((g) => this.getComputedStatus(g) === 'NEAR_LIMIT'));
    } else if (this.activeFilter() === 'EXCEEDED') {
      this.filteredGoals.set(filtered.filter((g) => this.getComputedStatus(g) === 'EXCEEDED'));
    } else if (this.activeFilter() === 'COMPLETED') {
      this.filteredGoals.set(filtered.filter(
        (g) =>
          (!g.isAutomatic &&
            ((g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED')) ||
          (g.isAutomatic && this.getComputedStatus(g) === 'BUDGET_COMPLETED')
      ));
    } else if (this.activeFilter() === 'ARCHIVED') {
      this.filteredGoals.set(filtered.filter(
          (g) => (g.status as string) === 'ABANDONED' || (g.status as string) === 'ARCHIVED'
        ));
    } else {
      this.filteredGoals.set(filtered.filter((g) => g.status === this.activeFilter()));
    }

    this.totalElements.set(this.filteredGoals().length);

    // Check if currentPage is out of bounds after filtering
    if (this.currentPage() >= this.totalPages) {
      this.currentPage.set(Math.max(0, this.totalPages - 1));
    }

    // Paginate
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    this.filteredGoals.set(this.filteredGoals().slice(start, end));
  }

  activeSort = signal('NEWEST');
  isSortDropdownOpen = signal(false);

  toggleSortDropdown() {
    this.isSortDropdownOpen.set(!this.isSortDropdownOpen());
  }

  setSort(sort: string) {
    this.activeSort.set(sort);
    this.isSortDropdownOpen.set(false);
    this.applyFilter();
  }

  getSortLabel(sort: string): string {
    const labels: Record<string, string> = {
      NEWEST: 'Newest',
      OLDEST: 'Oldest',
      HIGHEST_PROGRESS: 'Highest Progress',
      LEAST_PROGRESS: 'Least Progress',
      CLOSEST_LIMIT: 'Closest to Limit',
      ALPHABETICAL: 'Alphabetical',
    };
    return labels[sort] || 'Newest';
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

    this.createForm.get('goalType')?.valueChanges.subscribe((val) => {
      if (val && !this.isEditMode()) {
        const selected = this.GoalTypes.find((g) => g.value === val);
        if (selected) {
          this.createForm.patchValue({
            unit: selected.unit,
            title: selected.label,
          });
        }
      } else if (val && this.isEditMode()) {
        const selected = this.GoalTypes.find((g) => g.value === val);
        if (selected) {
          this.createForm.patchValue({
            unit: selected.unit,
          });
        }
      }
    });
  }

  // Icon fetching is now strictly inline SVGs within HTML via ngSwitch for dynamic content

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      analytics: this.selectedGoalId()
        ? this.goalService.getAnalytics(this.selectedGoalId()!).pipe(
            catchError((err) => {
              console.error('Error fetching analytics:', err);
              return of(null);
            }),
          )
        : of(null),
      goalsData: this.goalService.getGoals(0, 1000).pipe(
        catchError((err) => {
          console.error('Error fetching goals:', err);
          return of(null);
        }),
      ),
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (results) => {
          this.analytics.set(results.analytics);
          if (results.goalsData) {
            this.goals.set(results.goalsData.content);
            this.totalElements.set(results.goalsData.totalElements);
            this.applyFilter();

            this.globalStats.set({
              totalGoals: this.totalElements(),
              activeGoals: this.goals().filter((g) => g.status === 'ACTIVE').length,
              completedGoals: this.goals().filter(
                (g) =>
                  !g.isAutomatic &&
                  ((g.status as string) === 'ACHIEVED' || (g.status as string) === 'COMPLETED'),
              ).length,
              automaticGoals: this.goals().filter((g) => g.isAutomatic).length,
              manualGoals: this.goals().filter((g) => !g.isAutomatic).length,
              nearLimitGoals: this.goals().filter((g) => this.getComputedStatus(g) === 'NEAR_LIMIT')
                .length,
              exceededGoals: this.goals().filter((g) => this.getComputedStatus(g) === 'EXCEEDED')
                .length,
              completedBudgets: this.goals().filter(
                (g) => g.isAutomatic && this.getComputedStatus(g) === 'BUDGET_COMPLETED',
              ).length,
              expiringSoonGoals: this.goals().filter((g) => {
                const diffTime = Math.abs(new Date(g.targetDate).getTime() - new Date().getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                  diffDays <= 7 &&
                  (g.status as string) !== 'ACHIEVED' &&
                  (g.status as string) !== 'COMPLETED'
                );
              }).length,
            });
            this.calculateOverallHealth();

            // Fetch analytics for visible goals
            this.goals().forEach((goal) => {
              this.goalService.getAnalytics(goal.id).subscribe({
                next: (data) => {
                  this.goalAnalyticsMap.update(map => ({
                    ...map,
                    [goal.id]: data
                  }));
                },
                error: (err) => {
                  console.error(`Failed to fetch analytics for goal ${goal.id}`, err);
                },
              });
            });
          }
        },
        error: () => {
          this.errorMessage.set('Failed to load goals data. Please try again later.');
        },
      });
  }

  getProgressPercentage(current: number, target: number): number {
    if (!target || target <= 0) return 0;
    const percentage = (current / target) * 100;
    return percentage > 100 ? 100 : Math.round(percentage);
  }

  getAverageProgress(): number {
    if (this.goals().length === 0) return 0;
    const totalProgress = this.goals().reduce((acc, goal) => {
      return acc + this.getProgressPercentage(goal.currentValue, goal.targetValue);
    }, 0);
    return Math.round(totalProgress / this.goals().length);
  }

  getComputedStatus(goal: GoalResponse): string {
    const s = goal.status as string;
    if (s === 'ABANDONED' || s === 'ARCHIVED') return 'ARCHIVED';
    if (s === 'PAUSED') return 'PAUSED';
    if (s === 'ACHIEVED' || s === 'COMPLETED') return 'COMPLETED';
    if (!goal.isAutomatic) return goal.status;
    const limit = goal.targetValue;
    const current = goal.currentValue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(goal.targetDate);
    targetDate.setHours(23, 59, 59, 999);

    const isPastEnd = targetDate < today;

    if (current >= limit) return 'EXCEEDED';
    if (isPastEnd && current <= limit) return 'BUDGET_COMPLETED';
    if (current >= limit * 0.75) return 'NEAR_LIMIT';
    return 'WITHIN_BUDGET';
  }

  calculateOverallHealth() {
    const autoGoals = this.globalStats().automaticGoals;
    if (autoGoals === 0) {
      this.overallHealth.set('Good');
      return;
    }
    const healthy = autoGoals - (this.globalStats().nearLimitGoals + this.globalStats().exceededGoals);
    const healthRatio = healthy / autoGoals;
    if (healthRatio >= 0.8) this.overallHealth.set('Excellent');
    else if (healthRatio >= 0.5) this.overallHealth.set('Good');
    else if (healthRatio >= 0.2) this.overallHealth.set('Needs Attention');
    else this.overallHealth.set('Critical');
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
    if (percentage >= 50) return 'Usage is increasing faster than expected.';

    return "Great! You're using resources efficiently.";
  }

  getGoalCategory(type: string): string {
    const found = this.GoalTypes.find((g) => g.value === type);
    return found ? found.category : 'Goal';
  }

  getGoalIconName(type: string): string {
    const found = this.GoalTypes.find((g) => g.value === type);
    return found ? found.icon : 'target';
  }

  getGoalDesc(type: string): string {
    const found = this.GoalTypes.find((g) => g.value === type);
    return found ? found.desc : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EXCEEDED':
        return 'text-danger border-danger-subtle bg-danger-subtle';
      case 'NEAR_LIMIT':
        return 'text-warning border-warning-subtle bg-warning-subtle';
      case 'WITHIN_BUDGET':
        return 'text-success border-success-subtle bg-success-subtle';
      case 'BUDGET_COMPLETED':
      case 'COMPLETED':
      case 'ACHIEVED':
        return 'text-primary border-primary-subtle bg-primary-subtle';
      case 'ACTIVE':
        return 'text-primary border-primary-subtle bg-primary-subtle';
      default:
        return 'text-secondary border-secondary-subtle bg-secondary-subtle';
    }
  }

  getUnitForType(type: string): string {
    const found = this.GoalTypes.find((g) => g.value === type);
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

  getForecast(goal: GoalResponse): { usage: string; status: string; available: boolean } {
    if (goal.currentValue >= goal.targetValue) {
      return {
        usage: goal.currentValue.toFixed(1) + ' / ' + goal.targetValue + ' ' + goal.unit,
        status: 'Limit Reached',
        available: true,
      };
    }
    const avg = parseFloat(this.getAveragePerDay(goal));
    if (avg === 0 || isNaN(avg)) {
      return { usage: 'Forecast unavailable', status: 'Unknown', available: false };
    }
    const remainingDays = Math.max(
      0,
      Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const forecastedUsage = goal.currentValue + avg * remainingDays;
    return {
      usage: forecastedUsage.toFixed(1) + ' / ' + goal.targetValue + ' ' + goal.unit,
      status: forecastedUsage > goal.targetValue ? 'High Risk' : 'Safe',
      available: true,
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
    const analytics = this.goalAnalyticsMap()[goal.id];
    if (analytics && analytics.projectedCompletionDate) {
      const diff = new Date(analytics.projectedCompletionDate).getTime() - new Date().getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} Days` : 'Soon';
    }
    return 'N/A';
  }

  getSparkline(goal: GoalResponse): SafeHtml {
    const analytics = this.goalAnalyticsMap()[goal.id];
    if (!analytics || !analytics.history || analytics.history.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="text-muted fs-8">No trend available</span>`
      );
    }

    const history: any[] = analytics.history;
    // We only use up to 10 points
    const pointsData = history.slice(-10).map((h) => h.currentProgress);
    if (pointsData.length < 2) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<span class="text-muted fs-8">No trend available</span>`
      );
    }

    const maxProgress = Math.max(...pointsData, goal.targetValue);

    // Create polyline SVG
    const width = 80;
    const height = 30;
    const stepX = width / (pointsData.length - 1);

    const points = pointsData.map((val: any, idx: any) => {
      const x = idx * stepX;
      // y is inverted, height - scaled height
      const y = height - (val / maxProgress) * height;
      return `${x},${y}`;
    });

    const color = goal.isAutomatic ? '#10b981' : '#3b82f6';

    const svg = `<svg width="80" height="30" viewBox="0 0 80 30" style="overflow: visible;">
      <polyline fill="none" stroke="${color}" stroke-width="2" points="${points.join(' ')}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedGoalId.set(null);
    this.showCreateModal.set(true);
    this.modalErrorMessage.set('');
    this.aiOptimization.set(null);
    this.createForm.reset();
    document.body.style.overflow = 'hidden';
  }

  openEditModal(goal: GoalResponse): void {
    this.activeDropdownId.set(null);
    this.isEditMode.set(true);
    this.selectedGoalId.set(goal.id);
    this.showCreateModal.set(true);
    this.modalErrorMessage.set('');

    const tDate = goal.targetDate ? goal.targetDate.split('T')[0] : '';

    this.createForm.patchValue(
      {
        goalType: goal.goalType || '',
        title: goal.title,
        description: goal.description || '',
        targetValue: goal.targetValue,
        unit: goal.unit,
        targetDate: tDate,
      },
      { emitEvent: true },
    );
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.aiOptimization.set(null);
    document.body.style.overflow = '';
  }

  optimizeGoal(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.modalErrorMessage.set(
        'Please fill out all required fields before requesting optimization.',
      );
      return;
    }
    this.isOptimizing.set(true);
    this.modalErrorMessage.set('');
    this.aiOptimization.set(null);

    this.goalService
      .optimizeGoal(this.createForm.getRawValue())
      .pipe(
        finalize(() => {
          this.isOptimizing.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this.aiOptimization.set(res);
        },
        error: (err) => {
          this.modalErrorMessage.set(
            err.error?.message ||
              'AI optimization is temporarily unavailable. You can still save your goal manually.',
          );
        },
      });
  }

  acceptAiSuggestion(): void {
    if (this.aiOptimization() && this.aiOptimization()!.suggestedTarget) {
      this.createForm.patchValue({ targetValue: this.aiOptimization()!.suggestedTarget });
      this.aiOptimization.set(null); // Dismiss after accepting
    }
  }

  submitCreateGoal(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      if (this.createForm.get('targetDate')?.errors?.['futureDate']) {
        this.modalErrorMessage.set(
          'Please select a future target date to effectively track your goal progression.',
        );
      } else {
        this.modalErrorMessage.set(
          'Please review the form and fill in all required fields correctly.',
        );
      }
      return;
    }

    this.isSubmitting.set(true);
    this.modalErrorMessage.set('');

    const request$ =
      this.isEditMode() && this.selectedGoalId()
        ? this.goalService.updateGoal(this.selectedGoalId()!, this.createForm.getRawValue())
        : this.goalService.createGoal(this.createForm.getRawValue());

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.closeCreateModal();
          this.successMessage.set(
            this.isEditMode() ? 'Goal updated successfully!' : 'Goal created successfully!',
          );
          setTimeout(() => this.successMessage.set(''));
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage.set(
            err.error?.message ||
              `Failed to ${this.isEditMode() ? 'update' : 'create'} goal. Please verify your inputs.`,
          );
        },
      });
  }

  openProgressModal(goal: GoalResponse): void {
    this.activeDropdownId.set(null);
    this.selectedGoalId.set(goal.id);
    this.showProgressModal.set(true);
    this.modalErrorMessage.set('');
    this.progressForm.reset();
    document.body.style.overflow = 'hidden';
  }

  closeProgressModal(): void {
    this.showProgressModal.set(false);
    this.selectedGoalId.set(null);
    document.body.style.overflow = '';
  }

  submitProgress(): void {
    if (this.progressForm.invalid || !this.selectedGoalId()!) {
      this.progressForm.markAllAsTouched();
      this.modalErrorMessage.set('Please enter a valid progress amount to continue.');
      return;
    }
    this.isSubmitting.set(true);
    this.modalErrorMessage.set('');
    this.goalService
      .addProgress(this.selectedGoalId()!, this.progressForm.value)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.closeProgressModal();
          this.successMessage.set('Progress updated successfully!');
          setTimeout(() => this.successMessage.set(''));
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage.set(err.error?.message || 'Failed to update progress.');
        },
      });
  }

  confirmDelete(goal: GoalResponse): void {
    this.activeDropdownId.set(null);
    this.goalToDelete.set(goal);
    this.showDeleteModal.set(true);
    this.modalErrorMessage.set('');
    document.body.style.overflow = 'hidden';
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.goalToDelete.set(null);
    document.body.style.overflow = '';
  }

  deleteGoal(): void {
    if (!this.goalToDelete) return;
    this.isSubmitting.set(true);
    this.modalErrorMessage.set('');

    this.goalService
      .deleteGoal(this.goalToDelete()!.id)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.cancelDelete();
          this.successMessage.set('Goal deleted successfully!');
          setTimeout(() => this.successMessage.set(''));
          this.loadData();
        },
        error: (err) => {
          this.modalErrorMessage.set(err.error?.message || 'Failed to delete goal.');
        },
      });
  }

  groupedTimeline: { label: string; items: any[] }[] = [];

  openTimelineModal(goal: GoalResponse): void {
    this.activeDropdownId.set(null);
    this.timelineGoal.set(goal);
    this.showTimelineModal.set(true);
    this.isTimelineLoading.set(true);

    this.goalService
      .getAnalytics(goal.id)
      .pipe(
        finalize(() => {
          this.isTimelineLoading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          this.analytics.set(data);
          this.timelinePage.set(1);
          this.updateTimelineView();
        },
        error: (err) => {
          console.error('Failed to fetch analytics', err);
          this.analytics.set(null);
          this.groupedTimeline = [];
        },
      });

    document.body.style.overflow = 'hidden';
  }

  updateTimelineView(): void {
    const data = this.analytics();
    if (!data || !data.history) {
      this.groupTimelineItems([]);
      return;
    }
    const start = (this.timelinePage() - 1) * this.timelinePageSize;
    const pagedHistory = data.history.slice(start, start + this.timelinePageSize);
    this.groupTimelineItems(pagedHistory);
  }

  nextTimelinePage(): void {
    const data = this.analytics();
    if (data && data.history && this.timelinePage() * this.timelinePageSize < data.history.length) {
      this.timelinePage.set(this.timelinePage() + 1);
      this.updateTimelineView();
    }
  }

  prevTimelinePage(): void {
    if (this.timelinePage() > 1) {
      this.timelinePage.set(this.timelinePage() - 1);
      this.updateTimelineView();
    }
  }

  groupTimelineItems(history: any[]): void {
    this.groupedTimeline = [];
    if (!history || history.length === 0) return;

    const todayItems: any[] = [];
    const yesterdayItems: any[] = [];
    const earlierItems: any[] = [];

    const now = new Date();
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStr = todayStr - 1000 * 60 * 60 * 24;

    history.forEach((item) => {
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
    if (yesterdayItems.length > 0)
      this.groupedTimeline.push({ label: 'Yesterday', items: yesterdayItems });
    if (earlierItems.length > 0)
      this.groupedTimeline.push({ label: 'Earlier', items: earlierItems });
  }

  closeTimelineModal(): void {
    this.showTimelineModal.set(false);
    this.timelineGoal.set(null);
    this.analytics.set(null);
    document.body.style.overflow = '';
  }

  openAchievementsModal(): void {
    this.router.navigate(['/gamification/achievements'], { queryParams: { tab: 'GOAL' } });
  }

  closeAchievementsModal(): void {
    // Deprecated
  }

  toggleAchievementHistory(goalId: number): void {
    this.expandedAchievementId.set(this.expandedAchievementId() === goalId ? null : goalId);
  }

  getAchievementLabel(goal: GoalResponse): string {
    if (!goal.isAutomatic) {
      return 'Completed';
    }
    return 'Budget Completed';
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
    return this.achievements().filter((g) => !g.isAutomatic).length;
  }

  getAutoAchievementsCount(): number {
    return this.achievements().filter((g) => g.isAutomatic).length;
  }

  // --- CUSTOM CALENDAR LOGIC ---
  activeDateField: 'targetDate' | null = null;
  currentMonthDate: Date = new Date();
  calendarDays: { date: Date; day: number; isCurrentMonth: boolean }[] = [];
  weekDays: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  openCustomDatePicker(event: Event) {
    event.stopPropagation();
    if (this.activeDateField === 'targetDate') {
      this.activeDateField = null;
      return;
    }
    this.activeDateField = 'targetDate';
    const currentVal = this.createForm.get('targetDate')?.value || '';
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
      this.calendarDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
      });
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
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() - 1,
      1,
    );
    this.generateCalendar(this.currentMonthDate);
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() + 1,
      1,
    );
    this.generateCalendar(this.currentMonthDate);
  }

  selectDate(d: Date, event?: Event) {
    if (event) event.stopPropagation();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    this.createForm.patchValue({ targetDate: dateStr });
    this.activeDateField = null;
  }

  closeCustomPickers() {
    this.activeDateField = null;
  }

  setToday() {
    this.selectDate(new Date());
  }

  // Pagination methods
  get Math() {
    return Math;
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize());
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage.set(page);
      this.applyFilter();
    }
  }

  isPageSizeDropdownOpen = signal(false);

  togglePageSizeDropdown(): void {
    this.isPageSizeDropdownOpen.set(!this.isPageSizeDropdownOpen);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.isPageSizeDropdownOpen.set(false);
    this.loadData();
  }
}
