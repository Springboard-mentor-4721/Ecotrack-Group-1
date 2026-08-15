import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { MyChallengeEntry } from '../../../models/challenge.models';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { MyChallengeCardComponent } from '../shared/components/my-challenge-card/my-challenge-card.component';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { MyChallengesHeaderComponent } from './components/my-challenges-header/my-challenges-header.component';
import { MyChallengesTabBarComponent } from './components/my-challenges-tab-bar/my-challenges-tab-bar.component';
import { MyChallengesEmptyStateComponent } from './components/my-challenges-empty-state/my-challenges-empty-state.component';

export type TabType = 'ACTIVE' | 'COMPLETED' | 'FAILED';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-challenges-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MyChallengeCardComponent, LoadingSkeletonComponent, MyChallengesHeaderComponent, MyChallengesTabBarComponent, MyChallengesEmptyStateComponent],
  templateUrl: './my-challenges-page.component.html',
  styleUrls: ['./my-challenges-page.component.css']
})
export class MyChallengesPageComponent implements OnInit {
  allChallenges = signal<MyChallengeEntry[]>([]);
  filteredChallenges = signal<MyChallengeEntry[]>([]);
  
  isLoading = signal(false);
  errorMessage = signal('');
  
  currentTab = signal<TabType>('ACTIVE');
  
  currentPage = signal(0);
  pageSize = signal(100);
  
  tabs: { id: TabType, label: string }[] = [
    { id: 'ACTIVE', label: 'Active' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'FAILED', label: 'Failed' }
  ];

  constructor(
    private challengeService: ChallengeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyChallenges();
  }

  loadMyChallenges(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    // ARCHITECTURE NOTE (Phase 1 Container/Presentational):
    // The My Challenges Page employs an N+1 loading strategy to fetch participant progress
    // and stitch it with full challenge details. It caps the request at `size=100` to prevent
    // excessive network calls. In Phase 3, this should be optimized by a backend DTO 
    // that returns full details in a single request.
    
    // Load a large page size to ensure all active/completed/failed are fetched
    this.challengeService.getMyChallenges(this.currentPage(), this.pageSize())
      .pipe(
        map(response => {
          const participants = response.content;
          if (participants.length === 0) return [];
          return participants.map(participant => ({ participant, challenge: participant.challenge! } as MyChallengeEntry));
        }),
        finalize(() => {
          this.isLoading.set(false);
          })
      )
      .subscribe({
        next: (entries) => {
          this.allChallenges.set(entries);
          this.applyFilter();
        },
        error: (err) => {
          this.errorMessage.set('Failed to load your challenges. Please try again later.');
          console.error('Error fetching my challenges', err);
        }
      });
  }

  setTab(tab: TabType): void {
    this.currentTab.set(tab);
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.currentTab() === 'ACTIVE') {
      this.filteredChallenges.set(this.allChallenges().filter(c => c.participant.status === 'ACTIVE' || c.participant.status === 'WITHIN_BUDGET'));
    } else if (this.currentTab() === 'COMPLETED') {
      this.filteredChallenges.set(this.allChallenges().filter(c => c.participant.status === 'COMPLETED'));
    } else if (this.currentTab() === 'FAILED') {
      this.filteredChallenges.set(this.allChallenges().filter(c => c.participant.status === 'FAILED' || c.participant.status === 'DROPPED' || c.participant.status === 'EXCEEDED'));
    }
    }

  onCardClick(challengeId: number): void {
    this.router.navigate(['/challenges', challengeId]);
  }

  exploreClicked(): void {
    this.router.navigate(['/challenges/explore']);
  }
}
