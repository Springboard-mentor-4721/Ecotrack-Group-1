import { Component, OnInit, signal, computed } from '@angular/core';
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
  isLoading = signal(true);
  mode = signal<ModeType>('OVERALL');

  // Global
  filterPeriod = signal<FilterType>('ALL_TIME');
  filterScore = signal<ScoreType>('XP');
  globalPage = signal<Page<LeaderboardEntry> | null>(null);
  topThree = signal<LeaderboardEntry[]>([]);
  remainingEntries = signal<LeaderboardEntry[]>([]);

  // Challenges
  myChallenges = signal<any[]>([]);
  selectedChallengeId = signal<number | null>(null);
  challengePage = signal<Page<LeaderboardEntry> | null>(null);
  challengeError = signal<string | null>(null);
  challengeErrorIs403 = signal(false);
  isDropdownOpen = signal(false);

  selectedChallengeParticipant = computed(() => {
    const challenges = this.myChallenges();
    const id = this.selectedChallengeId();
    if (!challenges || !id) return null;
    return challenges.find(c => c.challengeId === id);
  });

  selectedChallengeDetail = signal<any | null>(null);

  currentUserId = signal<number | null>(null);
  myRank = signal<LeaderboardEntry | null>(null);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(20);

  Math = Math;

  constructor(
    private leaderboardService: LeaderboardService,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
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
       this.currentUserId.set(user.id);
    }

    this.route.queryParams.subscribe(params => {
      if (params['challengeId']) {
        this.mode.set('CHALLENGE');
        this.selectedChallengeId.set(Number(params['challengeId']));
      }
      if (params['mode']) {
        this.mode.set(params['mode'].toUpperCase() as ModeType);
      }

      this.loadInitialData();
    });
  }

  loadInitialData() {
    if (this.mode() === 'CHALLENGE') {
      this.loadMyChallenges().subscribe(() => {
        if (this.selectedChallengeId()) {
          this.loadSelectedChallengeDetail();
          this.loadChallengeLeaderboard();
        } else if (this.myChallenges().length > 0) {
          this.selectedChallengeId.set(this.myChallenges()[0].challengeId);
          this.loadSelectedChallengeDetail();
          this.loadChallengeLeaderboard();
        } else {
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadGlobalLeaderboard();
    }
  }

  loadMyChallenges() {
    this.isLoading.set(true);
    return this.challengeService.getMyChallenges(0, 100).pipe(
      tap(res => {
        if (res && res.content) {
          this.myChallenges.set(res.content);
        }
      }),
      catchError(err => of(null))
    );
  }

  setMode(mode: ModeType) {
    if (this.mode() === mode) return;
    this.mode.set(mode);
    this.currentPage.set(0);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: this.mode().toLowerCase() },
      queryParamsHandling: 'merge'
    });

    if (this.mode() === 'CHALLENGE') {
      if (this.myChallenges().length === 0) {
         this.loadMyChallenges().subscribe(() => {
            if (this.myChallenges().length > 0) {
               this.selectedChallengeId.set(this.myChallenges()[0].challengeId);
               this.loadSelectedChallengeDetail();
               this.loadChallengeLeaderboard();
            } else {
               this.isLoading.set(false);
            }
         });
      } else {
         if (!this.selectedChallengeId() && this.myChallenges().length > 0) {
            this.selectedChallengeId.set(this.myChallenges()[0].challengeId);
         }
         if (this.selectedChallengeId()) {
            this.loadSelectedChallengeDetail();
            this.loadChallengeLeaderboard();
         }
      }
    } else {
      this.loadGlobalLeaderboard();
    }
  }

  setFilterPeriod(period: FilterType) {
    if (this.filterPeriod() === period) return;
    this.filterPeriod.set(period);
    this.currentPage.set(0);

    if (this.filterScore() === 'ECO_SCORE' && period !== 'ALL_TIME') {
       this.filterScore.set('XP');
    }

    this.loadGlobalLeaderboard();
  }

  setFilterScore(score: ScoreType) {
    if (this.filterScore() === score) return;
    this.filterScore.set(score);
    this.currentPage.set(0);

    if (score === 'ECO_SCORE') {
       this.filterPeriod.set('ALL_TIME');
    }

    this.loadGlobalLeaderboard();
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  selectCustomChallenge(id: number) {
    this.selectedChallengeId.set(id);
    this.isDropdownOpen.set(false);
    this.currentPage.set(0);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { challengeId: this.selectedChallengeId() },
      queryParamsHandling: 'merge'
    });
    this.loadSelectedChallengeDetail();
    this.loadChallengeLeaderboard();
  }

  getSelectedChallengeTitle(): string {
    const participant = this.selectedChallengeParticipant();
    return participant ? participant.challengeTitle : 'Select Challenge';
  }

  loadGlobalLeaderboard() {
    this.isLoading.set(true);

    // Fetch my rank if needed (fire and forget)
    if (this.filterPeriod() === 'ALL_TIME') {
       this.leaderboardService.getMyRank(this.filterScore(), this.filterPeriod()).subscribe({
          next: (rank) => {
            if (rank) this.myRank.set(rank);
          },
          error: (err) => console.error('Failed to load user rank', err)
       });
    } else {
       this.myRank.set(null); // Clear rank if not ALL_TIME, unless we want monthly rank too
    }

    // Fetch the global page independently
    this.leaderboardService.getGlobalLeaderboard(
      this.filterScore(),
      this.filterPeriod(),
      this.currentPage(),
      this.pageSize()
    ).pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (page) => {
        if (page) {
          this.globalPage.set(page);
          this.updatePodium();
        } else {
          this.globalPage.set(null);
          this.topThree.set([]);
          this.remainingEntries.set([]);
        }
      },
      error: () => {
        this.globalPage.set(null);
        this.topThree.set([]);
        this.remainingEntries.set([]);
      }
    });
  }

  loadSelectedChallengeDetail() {
    if (!this.selectedChallengeId()) return;
    this.selectedChallengeDetail.set(null);
    this.challengeService.getChallengeDetail(this.selectedChallengeId()!).subscribe({
      next: (detail) => {
        this.selectedChallengeDetail.set(detail);
      },
      error: (err) => {
        console.error('Failed to load challenge details', err);
      }
    });
  }

  myChallengeRankEntry = signal<LeaderboardEntry | null>(null);

  getChallengeProgressPercentage(): number {
    const participant = this.selectedChallengeParticipant();
    if (!participant || !participant.targetValue) return 0;
    const p = Math.min(Math.max((participant.progress / participant.targetValue) * 100, 0), 100);
    return Math.round(p);
  }

  getMyChallengeRank(): number | null {
    return this.myChallengeRankEntry() ? this.myChallengeRankEntry()!.rank : null;
  }

  scrollToLeaderboard() {
    const el = document.getElementById('challenge-leaderboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadChallengeLeaderboard() {
    if (!this.selectedChallengeId()) return;
    this.isLoading.set(true);
    this.challengeError.set(null);
    this.challengeErrorIs403.set(false);

    // Fetch user rank independently
    this.myChallengeRankEntry.set(null);
    this.leaderboardService.getMyChallengeRank(this.selectedChallengeId()!).subscribe({
        next: (rank) => this.myChallengeRankEntry.set(rank),
        error: () => {}
    });

    this.leaderboardService.getChallengeLeaderboard(this.selectedChallengeId()!, this.currentPage(), this.pageSize())
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (page) => {
          this.challengePage.set(page);
        },
        error: (err) => {
          if (err.status === 403) {
            this.challengeErrorIs403.set(true);
          } else {
            this.challengeError.set('Failed to load challenge leaderboard. Please try again.');
          }
          this.challengePage.set(null);
        }
      });
  }

  updatePodium(): void {
    const globalPage = this.globalPage();
    if (globalPage && globalPage.content) {
      if (this.currentPage() === 0 && globalPage.content.length >= 3) {
        this.topThree.set(globalPage.content.slice(0, 3));
        this.remainingEntries.set(globalPage.content.slice(3));
      } else {
        this.topThree.set([]);
        this.remainingEntries.set(globalPage.content);
      }
    } else {
      this.topThree.set([]);
      this.remainingEntries.set([]);
    }
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-light text-yellow-600 border-yellow-600';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-light text-orange border-orange';
    return 'bg-surface text-secondary border-transparent';
  }

  nextPage() {
    if (this.mode() === 'OVERALL' && this.globalPage() && !this.globalPage()!.last) {
       this.currentPage.update(p => p + 1);
       this.loadGlobalLeaderboard();
    } else if (this.mode() === 'CHALLENGE' && this.challengePage() && !this.challengePage()!.last) {
       this.currentPage.update(p => p + 1);
       this.loadChallengeLeaderboard();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
       this.currentPage.update(p => p - 1);
       if (this.mode() === 'OVERALL') this.loadGlobalLeaderboard();
       else this.loadChallengeLeaderboard();
    }
  }
}
