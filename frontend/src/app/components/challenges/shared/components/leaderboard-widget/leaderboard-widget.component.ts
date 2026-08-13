import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from '../../../../../services/leaderboard.service';
import { LeaderboardEntry } from '../../../../../models/leaderboard.models';
import { ChallengeStatusBadgeComponent } from '../status-badge/challenge-status-badge.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-leaderboard-widget',
  standalone: true,
  imports: [CommonModule, ChallengeStatusBadgeComponent, RouterModule],
  templateUrl: './leaderboard-widget.component.html',
  styleUrls: ['./leaderboard-widget.component.css']
})
export class LeaderboardWidgetComponent implements OnInit, OnChanges {
  @Input() challengeId!: number;

  participants: LeaderboardEntry[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  has403Error: boolean = false;

  constructor(private leaderboardService: LeaderboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.challengeId) {
      this.loadLeaderboard();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['challengeId'] && !changes['challengeId'].firstChange) {
      this.loadLeaderboard();
    }
  }

  private loadLeaderboard(): void {
    this.isLoading = true;
    this.hasError = false;
    this.has403Error = false;
    
    this.leaderboardService.getChallengeLeaderboard(this.challengeId, 0, 5).subscribe({
      next: (page) => {
        this.participants = page.content;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err.status === 403) {
           this.has403Error = true;
        } else {
           this.hasError = true;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
