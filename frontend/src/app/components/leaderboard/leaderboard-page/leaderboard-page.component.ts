import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../services/leaderboard.service';
import { LeaderboardEntry, Page } from '../../../models/leaderboard.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { ChallengeService } from '../../../services/challenge.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { finalize, catchError, tap } from 'rxjs/operators';
import { ChallengeStatusBadgeComponent } from '../../challenges/shared/components/status-badge/challenge-status-badge.component';

import { environment } from '../../../../environments/environment';

type ModeType = 'OVERALL' | 'CHALLENGE';
type FilterType = 'ALL_TIME' | 'MONTHLY' | 'WEEKLY';
type ScoreType = 'XP' | 'ECO_SCORE';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSkeletonComponent, ChallengeStatusBadgeComponent],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.css'
})
export class LeaderboardPageComponent implements OnInit {
  isLoading = true;
  mode: ModeType = 'OVERALL';
  
  // Global
  filterPeriod: FilterType = 'ALL_TIME';
  filterScore: ScoreType = 'XP';
  globalPage: Page<LeaderboardEntry> | null = null;
  topThree: LeaderboardEntry[] = [];
  remainingEntries: LeaderboardEntry[] = [];
  
  // Challenges
  myChallenges: any[] = [];
  selectedChallengeId: number | null = null;
  challengePage: Page<LeaderboardEntry> | null = null;
  challengeError: string | null = null;
  challengeErrorIs403: boolean = false;
  
  get selectedChallengeParticipant(): any {
    if (!this.myChallenges || !this.selectedChallengeId) return null;
    return this.myChallenges.find(c => c.challengeId === this.selectedChallengeId);
  }

  selectedChallengeDetail: any | null = null;
  
  currentUserId: number | null = null;
  myRank: LeaderboardEntry | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 20;

  Math = Math;

  constructor(
    private leaderboardService: LeaderboardService,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http')) return url;
    const backendUrl = environment.apiUrl || 'http://localhost:8080';
    return backendUrl + (url.startsWith('/') ? url : '/' + url);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
       this.currentUserId = user.id;
    }
    
    this.route.queryParams.subscribe(params => {
      if (params['challengeId']) {
        this.mode = 'CHALLENGE';
        this.selectedChallengeId = Number(params['challengeId']);
      }
      if (params['mode']) {
        this.mode = params['mode'].toUpperCase() as ModeType;
      }
      
      this.loadInitialData();
    });
  }

  loadInitialData() {
    if (this.mode === 'CHALLENGE') {
      this.loadMyChallenges().subscribe(() => {
        if (this.selectedChallengeId) {
          this.loadSelectedChallengeDetail();
          this.loadChallengeLeaderboard();
        } else if (this.myChallenges.length > 0) {
          this.selectedChallengeId = this.myChallenges[0].challengeId;
          this.loadSelectedChallengeDetail();
          this.loadChallengeLeaderboard();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadGlobalLeaderboard();
    }
  }

  loadMyChallenges() {
    this.isLoading = true;
    return this.challengeService.getMyChallenges(0, 100).pipe(
      tap(res => {
        if (res && res.content) {
          this.myChallenges = res.content;
        }
      }),
      catchError(err => of(null))
    );
  }

  setMode(mode: ModeType) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.currentPage = 0;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: this.mode.toLowerCase() },
      queryParamsHandling: 'merge'
    });

    if (this.mode === 'CHALLENGE') {
      if (this.myChallenges.length === 0) {
         this.loadMyChallenges().subscribe(() => {
            if (this.myChallenges.length > 0) {
               this.selectedChallengeId = this.myChallenges[0].challengeId;
               this.loadSelectedChallengeDetail();
               this.loadChallengeLeaderboard();
            } else {
               this.isLoading = false;
               this.cdr.detectChanges();
            }
         });
      } else {
         if (!this.selectedChallengeId && this.myChallenges.length > 0) {
            this.selectedChallengeId = this.myChallenges[0].challengeId;
         }
         if (this.selectedChallengeId) {
            this.loadSelectedChallengeDetail();
            this.loadChallengeLeaderboard();
         }
      }
    } else {
      this.loadGlobalLeaderboard();
    }
  }

  setFilterPeriod(period: FilterType) {
    if (this.filterPeriod === period) return;
    this.filterPeriod = period;
    this.currentPage = 0;
    
    if (this.filterScore === 'ECO_SCORE' && period !== 'ALL_TIME') {
       this.filterScore = 'XP';
    }
    
    this.loadGlobalLeaderboard();
  }

  setFilterScore(score: ScoreType) {
    if (this.filterScore === score) return;
    this.filterScore = score;
    this.currentPage = 0;
    
    if (score === 'ECO_SCORE') {
       this.filterPeriod = 'ALL_TIME';
    }
    
    this.loadGlobalLeaderboard();
  }
  
  onChallengeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.selectedChallengeId = Number(target.value);
      this.currentPage = 0;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { challengeId: this.selectedChallengeId },
        queryParamsHandling: 'merge'
      });
      this.loadSelectedChallengeDetail();
      this.loadChallengeLeaderboard();
    }
  }

  loadGlobalLeaderboard() {
    this.isLoading = true;
    
    // Fetch my rank if needed (fire and forget)
    if (this.filterScore === 'XP' && this.filterPeriod === 'ALL_TIME' && !this.myRank) {
       this.leaderboardService.getMyRank().subscribe({
          next: (rank) => {
            if (rank) this.myRank = rank;
          },
          error: (err) => console.error('Failed to load user rank', err)
       });
    }

    // Fetch the global page independently
    this.leaderboardService.getGlobalLeaderboard(
      this.filterScore, 
      this.filterPeriod, 
      this.currentPage, 
      this.pageSize
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (page) => {
        if (page) {
          this.globalPage = page;
          this.updatePodium();
        } else {
          this.globalPage = null;
          this.topThree = [];
          this.remainingEntries = [];
        }
      },
      error: () => {
        this.globalPage = null;
        this.topThree = [];
        this.remainingEntries = [];
      }
    });
  }

  loadSelectedChallengeDetail() {
    if (!this.selectedChallengeId) return;
    this.selectedChallengeDetail = null;
    this.challengeService.getChallengeDetail(this.selectedChallengeId).subscribe({
      next: (detail) => {
        this.selectedChallengeDetail = detail;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load challenge details', err);
      }
    });
  }

  getChallengeProgressPercentage(): number {
    const participant = this.selectedChallengeParticipant;
    if (!participant || !participant.targetValue) return 0;
    const p = Math.min(Math.max((participant.progress / participant.targetValue) * 100, 0), 100);
    return Math.round(p);
  }

  getMyChallengeRank(): number | null {
    if (!this.currentUserId || !this.challengePage || !this.challengePage.content) return null;
    const myEntry = this.challengePage.content.find(e => e.userId === this.currentUserId);
    return myEntry ? myEntry.rank : null;
  }
  
  scrollToLeaderboard() {
    const el = document.getElementById('challenge-leaderboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadChallengeLeaderboard() {
    if (!this.selectedChallengeId) return;
    this.isLoading = true;
    this.challengeError = null;
    this.challengeErrorIs403 = false;

    this.leaderboardService.getChallengeLeaderboard(this.selectedChallengeId, this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (page) => {
          this.challengePage = page;
        },
        error: (err) => {
          if (err.status === 403) {
            this.challengeErrorIs403 = true;
          } else {
            this.challengeError = 'Failed to load challenge leaderboard. Please try again.';
          }
          this.challengePage = null;
        }
      });
  }

  updatePodium(): void {
    if (this.globalPage && this.globalPage.content) {
      if (this.currentPage === 0 && this.globalPage.content.length >= 3) {
        this.topThree = this.globalPage.content.slice(0, 3);
        this.remainingEntries = this.globalPage.content.slice(3);
      } else {
        this.topThree = [];
        this.remainingEntries = this.globalPage.content;
      }
    } else {
      this.topThree = [];
      this.remainingEntries = [];
    }
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-light text-yellow-600 border-yellow-600';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-light text-orange border-orange';
    return 'bg-surface text-secondary border-transparent';
  }
  
  nextPage() {
    if (this.mode === 'OVERALL' && this.globalPage && !this.globalPage.last) {
       this.currentPage++;
       this.loadGlobalLeaderboard();
    } else if (this.mode === 'CHALLENGE' && this.challengePage && !this.challengePage.last) {
       this.currentPage++;
       this.loadChallengeLeaderboard();
    }
  }
  
  prevPage() {
    if (this.currentPage > 0) {
       this.currentPage--;
       if (this.mode === 'OVERALL') this.loadGlobalLeaderboard();
       else this.loadChallengeLeaderboard();
    }
  }
}
