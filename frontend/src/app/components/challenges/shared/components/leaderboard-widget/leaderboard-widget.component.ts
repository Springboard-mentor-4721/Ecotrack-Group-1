import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService } from '../../../../../services/challenge.service';
import { ChallengeParticipant } from '../../../../../models/challenge.models';
import { ChallengeStatusBadgeComponent } from '../status-badge/challenge-status-badge.component';

@Component({
  selector: 'app-leaderboard-widget',
  standalone: true,
  imports: [CommonModule, ChallengeStatusBadgeComponent],
  templateUrl: './leaderboard-widget.component.html',
  styleUrls: ['./leaderboard-widget.component.css']
})
export class LeaderboardWidgetComponent implements OnInit, OnChanges {
  @Input() challengeId!: number;

  participants: ChallengeParticipant[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;

  // ARCHITECTURE NOTE (Phase 2 Gamification):
  // LeaderboardWidgetComponent is the explicitly approved exception to the strict 
  // Container/Presentational rules. It is permitted to inject ChallengeService 
  // to fetch its own data (lazy loading) so that it doesn't block the rendering
  // of the main Challenge Detail page.
  constructor(private challengeService: ChallengeService, private cdr: ChangeDetectorRef) {}

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
    
    // Fetch up to 100 participants and sort them client-side for correct prioritization
    this.challengeService.getChallengeParticipants(this.challengeId, 0, 100, 'progress,desc')
      .subscribe({
        next: (response) => {
          let allParticipants = response.content || [];
          
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
          
          this.participants = allParticipants.slice(0, 5);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load leaderboard', err);
          this.hasError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
