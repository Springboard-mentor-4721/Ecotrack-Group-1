import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../services/leaderboard.service';
import { LeaderboardEntry } from '../../../models/leaderboard.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ChallengeService } from '../../../services/challenge.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { ChallengeStatusBadgeComponent } from '../../challenges/shared/components/status-badge/challenge-status-badge.component';

type FilterType = 'ALL_TIME' | 'MONTHLY' | 'WEEKLY';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSkeletonComponent, ChallengeStatusBadgeComponent],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.css'
})
export class LeaderboardPageComponent implements OnInit {
  isLoading = true;
  entries: LeaderboardEntry[] = [];
  myRank: LeaderboardEntry | null = null;
  filterType: FilterType = 'ALL_TIME';
  challengeId: number | null = null;
  challengeTitle: string = '';

  // Math object for template
  Math = Math;

  constructor(
    private leaderboardService: LeaderboardService,
    private challengeService: ChallengeService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['challengeId']) {
        this.challengeId = Number(params['challengeId']);
        this.loadChallengeData();
      } else {
        this.challengeId = null;
        this.loadData();
      }
    });
  }

  setFilter(type: FilterType): void {
    if (this.filterType === type) return;
    this.filterType = type;
    this.loadData();
  }

  loadChallengeData(): void {
    if (!this.challengeId) return;
    this.isLoading = true;
    
    // Fetch challenge details to get the title, and participants for the list
    forkJoin({
      challenge: this.challengeService.getChallengeDetail(this.challengeId).pipe(catchError(() => of(null))),
      participants: this.challengeService.getChallengeParticipants(this.challengeId, 0, 50, 'progress,desc').pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(result => {
      if (result.challenge) {
        this.challengeTitle = result.challenge.title;
      }
      if (result.participants && result.participants.content) {
        let allParticipants = result.participants.content;
        
        allParticipants.sort((a, b) => {
          if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
          if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
          
          if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateA - dateB;
          }
          
          return b.progress - a.progress;
        });

        this.entries = allParticipants.map((p, index) => ({
          userId: p.userId,
          username: p.userName || 'User',
          scoreValue: p.progress,
          rank: index + 1,
          status: p.status,
          completedAt: p.completedAt
        }));
      } else {
        this.entries = [];
      }
      this.myRank = null; // Optional: highlight current user if needed, could find in entries
      this.cdr.detectChanges();
    });
  }

  loadData(): void {
    this.isLoading = true;
    
    const request$ = this.filterType === 'ALL_TIME' 
      ? this.leaderboardService.getAllTime()
      : this.filterType === 'MONTHLY' 
        ? this.leaderboardService.getMonthly()
        : this.leaderboardService.getWeekly();

    forkJoin({
      entries: request$.pipe(catchError(() => of([]))),
      myRank: this.myRank ? of(this.myRank) : this.leaderboardService.getMyRank().pipe(catchError(() => of(null)))
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(result => {
      this.entries = result.entries;
      if (!this.myRank && result.myRank) {
        this.myRank = result.myRank;
      }
      this.cdr.detectChanges();
    });
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-light text-yellow-600 border-yellow-600';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-light text-orange border-orange';
    return 'bg-surface text-secondary border-transparent';
  }
}
