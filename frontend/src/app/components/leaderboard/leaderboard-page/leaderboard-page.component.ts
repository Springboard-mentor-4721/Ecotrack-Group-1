import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../services/leaderboard.service';
import { LeaderboardEntry } from '../../../models/leaderboard.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

type FilterType = 'ALL_TIME' | 'MONTHLY' | 'WEEKLY';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSkeletonComponent],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.css'
})
export class LeaderboardPageComponent implements OnInit {
  isLoading = true;
  entries: LeaderboardEntry[] = [];
  myRank: LeaderboardEntry | null = null;
  filterType: FilterType = 'ALL_TIME';

  // Math object for template
  Math = Math;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  setFilter(type: FilterType): void {
    if (this.filterType === type) return;
    this.filterType = type;
    this.loadData();
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
      finalize(() => this.isLoading = false)
    ).subscribe(result => {
      this.entries = result.entries;
      if (!this.myRank && result.myRank) {
        this.myRank = result.myRank;
      }
    });
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-light text-yellow-600 border-yellow-600';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-light text-orange border-orange';
    return 'bg-surface text-secondary border-transparent';
  }
}
