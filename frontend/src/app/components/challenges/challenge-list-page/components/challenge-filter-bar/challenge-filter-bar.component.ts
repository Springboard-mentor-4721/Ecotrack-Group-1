import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenge-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-filter-bar.component.html'
})
export class ChallengeFilterBarComponent {
  // Required by contract
  @Input() selectedCategory?: string;
  @Input() selectedDifficulty?: string;
  @Input() selectedStatus?: string;
  @Input() selectedSort?: string;
  @Input() availableCategories?: any[];
  @Input() availableDifficulties?: any[];
  @Input() availableStatuses?: any[];
  @Input() isLoading: boolean = false;

  @Output() categoryChanged = new EventEmitter<string>();
  @Output() difficultyChanged = new EventEmitter<string>();
  @Output() statusChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  // Required by existing implementation
  @Input() evaluationFilter: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' = 'ALL';
  @Input() trackingFilter: 'ALL' | 'AUTOMATIC' | 'MANUAL' = 'ALL';
  @Input() sortFilter: string = 'newest';
  @Output() evaluationFilterChange = new EventEmitter<'ALL' | 'ACHIEVEMENT' | 'BUDGET'>();
  @Output() trackingFilterChange = new EventEmitter<'ALL' | 'AUTOMATIC' | 'MANUAL'>();
  @Output() sortFilterChange = new EventEmitter<string>();

  setEvaluationFilter(val: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' | any) {
    this.evaluationFilterChange.emit(val);
  }

  setTrackingFilter(val: 'ALL' | 'AUTOMATIC' | 'MANUAL' | any) {
    this.trackingFilterChange.emit(val);
  }

  setSortFilter(val: string | any) {
    this.sortFilterChange.emit(val);
  }
}