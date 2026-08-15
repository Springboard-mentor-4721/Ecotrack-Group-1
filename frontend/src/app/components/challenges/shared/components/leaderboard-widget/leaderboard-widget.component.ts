import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
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

  participants = signal<LeaderboardEntry[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  has403Error = signal(false);

  constructor(private leaderboardService: LeaderboardService) {}

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
    this.isLoading.set(true);
    this.hasError.set(false);
    this.has403Error.set(false);
    
    this.leaderboardService.getChallengeLeaderboard(this.challengeId, 0, 5).subscribe({
      next: (page) => {
        this.participants.set(page.content);
        this.isLoading.set(false);
        },
      error: (err) => {
        if (err.status === 403) {
           this.has403Error.set(true);
        } else {
           this.hasError.set(true);
        }
        this.isLoading.set(false);
        }
    });
  }
}
