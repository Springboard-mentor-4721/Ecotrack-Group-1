import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChallengeService } from '../../../services/challenge.service';
import { Challenge } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';

import { ChallengeCardComponent } from '../shared/components/challenge-card/challenge-card.component';
import { ExplorePageHeaderComponent } from './components/explore-page-header/explore-page-header.component';
import { ResultsCountComponent } from './components/results-count/results-count.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { PaginationControlComponent } from './components/pagination-control/pagination-control.component';
import { ChallengeSearchInputComponent } from './components/challenge-search-input/challenge-search-input.component';
import { ChallengeFilterBarComponent } from './components/challenge-filter-bar/challenge-filter-bar.component';
import { getDaysRemaining } from '../shared/utils/date.utils';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-challenge-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent, ChallengeCardComponent, ExplorePageHeaderComponent, ResultsCountComponent, EmptyStateComponent, PaginationControlComponent, ChallengeSearchInputComponent, ChallengeFilterBarComponent],
  templateUrl: './challenge-list-page.component.html',
  styleUrl: './challenge-list-page.component.css'
})
export class ChallengeListPageComponent implements OnInit {
  isLoading = signal(true);
  hasError = signal(false);
  challenges = signal<Challenge[]>([]);

  // Filtering & Search
  searchQuery = signal('');
  evaluationFilter = signal<'ALL' | 'ACHIEVEMENT' | 'BUDGET'>('ALL');
  trackingFilter = signal<'ALL' | 'AUTOMATIC' | 'MANUAL'>('ALL');
  sortFilter = signal<string>('newest');

  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(12);

  constructor(
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading.set(true);

    let sortParam = 'id,desc';
    if (this.sortFilter() === 'oldest') sortParam = 'id,asc';
    else if (this.sortFilter() === 'a-z') sortParam = 'title,asc';
    else if (this.sortFilter() === 'z-a') sortParam = 'title,desc';

    this.challengeService.getChallenges(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.evaluationFilter(),
      this.trackingFilter(),
      sortParam
    )
      .pipe(finalize(() => {
        this.isLoading.set(false);
        }))
      .subscribe({
        next: (res) => {
          this.challenges.set(res.content || []);
          this.totalPages.set(res.totalPages || 0);
          this.totalElements.set(res.totalElements || 0);
          },
        error: (err) => {
          console.error('Failed to load challenges', err);
          this.hasError.set(true);
          }
      });
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(v => v - 1);
      this.loadChallenges();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(v => v + 1);
      this.loadChallenges();
    }
  }

  filteredChallenges = computed(() => this.challenges());

  setEvaluationFilter(type: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' | any): void {
    this.evaluationFilter.set(type);
    this.currentPage.set(0);
    this.loadChallenges();
  }

  setTrackingFilter(type: 'ALL' | 'AUTOMATIC' | 'MANUAL' | any): void {
    this.trackingFilter.set(type);
    this.currentPage.set(0);
    this.loadChallenges();
  }

  setSortFilter(type: string | any): void {
    this.sortFilter.set(type);
    this.currentPage.set(0);
    this.loadChallenges();
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(0);
    this.loadChallenges();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.loadChallenges();
  }

  isUrgent(endDate: string): boolean {
    const days = getDaysRemaining(endDate);
    return days > 0 && days <= 2;
  }

  isWarning(endDate: string): boolean {
    const days = getDaysRemaining(endDate);
    return days > 2 && days <= 5;
  }
}
