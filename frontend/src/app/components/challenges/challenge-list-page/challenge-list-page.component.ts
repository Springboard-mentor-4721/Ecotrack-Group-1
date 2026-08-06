import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'app-challenge-list-page',
  standalone: true,
  imports: [CommonModule, LoadingSkeletonComponent, ChallengeCardComponent, ExplorePageHeaderComponent, ResultsCountComponent, EmptyStateComponent, PaginationControlComponent, ChallengeSearchInputComponent, ChallengeFilterBarComponent],
  templateUrl: './challenge-list-page.component.html',
  styleUrl: './challenge-list-page.component.css'
})
export class ChallengeListPageComponent implements OnInit {
  isLoading = true;
  hasError = false;
  challenges: Challenge[] = [];
  
  // Filtering & Search
  searchQuery = '';
  evaluationFilter: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' = 'ALL';
  trackingFilter: 'ALL' | 'AUTOMATIC' | 'MANUAL' = 'ALL';
  sortFilter: string = 'newest';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 12;

  constructor(
    private challengeService: ChallengeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.isLoading = true;
    
    let sortParam = 'id,desc';
    if (this.sortFilter === 'oldest') sortParam = 'id,asc';
    else if (this.sortFilter === 'a-z') sortParam = 'title,asc';
    else if (this.sortFilter === 'z-a') sortParam = 'title,desc';

    this.challengeService.getChallenges(
      this.currentPage, 
      this.pageSize,
      this.searchQuery,
      this.evaluationFilter,
      this.trackingFilter,
      sortParam
    )
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.challenges = res.content || [];
          this.totalPages = res.totalPages || 0;
          this.totalElements = res.totalElements || 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load challenges', err);
          this.hasError = true;
          this.cdr.detectChanges();
        }
      });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadChallenges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadChallenges();
    }
  }

  get filteredChallenges(): Challenge[] {
    return this.challenges;
  }

  setEvaluationFilter(type: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' | any): void {
    this.evaluationFilter = type;
    this.currentPage = 0;
    this.loadChallenges();
  }

  setTrackingFilter(type: 'ALL' | 'AUTOMATIC' | 'MANUAL' | any): void {
    this.trackingFilter = type;
    this.currentPage = 0;
    this.loadChallenges();
  }

  setSortFilter(type: string | any): void {
    this.sortFilter = type;
    this.currentPage = 0;
    this.loadChallenges();
  }

  onSearchChange(val: string): void {
    this.searchQuery = val;
    this.currentPage = 0;
    this.loadChallenges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
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
