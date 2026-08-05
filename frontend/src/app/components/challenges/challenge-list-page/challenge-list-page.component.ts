import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChallengeImagePipe } from '../shared/pipes/challenge-image.pipe';
import { ChallengeStatusBadgeComponent } from '../shared/components/status-badge/challenge-status-badge.component';
import { FormsModule } from '@angular/forms';
import { ChallengeCardComponent } from '../shared/components/challenge-card/challenge-card.component';
import { getDaysRemaining } from '../shared/utils/date.utils';

@Component({
  selector: 'app-challenge-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSkeletonComponent, ChallengeCardComponent],
  templateUrl: './challenge-list-page.component.html',
  styleUrl: './challenge-list-page.component.css'
})
export class ChallengeListPageComponent implements OnInit {
  isLoading = true;
  challenges: Challenge[] = [];
  
  // Filtering & Search
  searchQuery = '';
  evaluationFilter: 'ALL' | 'ACHIEVEMENT' | 'BUDGET' = 'ALL';
  trackingFilter: 'ALL' | 'AUTOMATIC' | 'MANUAL' = 'ALL';

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
    this.challengeService.getChallenges(this.currentPage, this.pageSize)
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
    return this.challenges.filter(c => {
      // Search
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query || 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query);
      
      // Eval Type
      const matchesEval = this.evaluationFilter === 'ALL' || c.challengeEvaluationType === this.evaluationFilter;
      
      // Tracking
      const matchesTrack = this.trackingFilter === 'ALL' || c.trackingMethod === this.trackingFilter;

      return matchesSearch && matchesEval && matchesTrack;
    });
  }

  setEvaluationFilter(type: 'ALL' | 'ACHIEVEMENT' | 'BUDGET'): void {
    this.evaluationFilter = type;
  }

  setTrackingFilter(type: 'ALL' | 'AUTOMATIC' | 'MANUAL'): void {
    this.trackingFilter = type;
  }

  clearSearch(): void {
    this.searchQuery = '';
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
