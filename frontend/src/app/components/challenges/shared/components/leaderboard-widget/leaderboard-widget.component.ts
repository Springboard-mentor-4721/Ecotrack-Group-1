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
  challengeUnit: string = 'Progress';

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
    
    import('rxjs').then(({ forkJoin, of }) => {
      import('rxjs/operators').then(({ catchError }) => {
        forkJoin({
          challenge: this.challengeService.getChallengeDetail(this.challengeId).pipe(catchError(() => of(null))),
          participants: this.challengeService.getChallengeParticipants(this.challengeId, 0, 100, 'progress,desc').pipe(catchError(() => of(null)))
        }).subscribe({
          next: (result) => {
            let allParticipants = result.participants?.content || [];
            let isBudget = result.challenge?.challengeEvaluationType === 'BUDGET';
            
            if (result.challenge) {
              let unit = result.challenge.derivedUnit || 
                (result.challenge.progressMetric === 'ENTRY_COUNT' ? 'Entries' : 
                (result.challenge.progressMetric === 'CARBON_EMISSION' ? 'kg CO₂' : 'Quantity'));
              if (unit.toLowerCase() === 'kgco2e' || unit.toLowerCase() === 'kg co2e') {
                unit = 'kg CO₂e';
              } else if (unit.toLowerCase() === 'kgco2' || unit.toLowerCase() === 'kg co2') {
                unit = 'kg CO₂';
              }
              this.challengeUnit = unit;
            }
            
            let currentDays = 0;
            let currentBudget = 0;
            
            if (isBudget && result.challenge) {
              const start = new Date(result.challenge.startDate).getTime();
              const end = new Date(result.challenge.endDate).getTime();
              const now = Date.now();
              const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
              currentDays = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
              if (currentDays > totalDays) currentDays = totalDays;
              
              const dailyAvg = result.challenge.targetValue / totalDays;
              currentBudget = dailyAvg * currentDays;
            }

            allParticipants.sort((a, b) => {
              if (isBudget) {
                const aExceeded = a.progress > currentBudget;
                const bExceeded = b.progress > currentBudget;
                
                if (aExceeded !== bExceeded) {
                  return aExceeded ? 1 : -1;
                }
                return a.progress - b.progress;
              } else {
                if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
                if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
                
                if (a.status === 'COMPLETED' && b.status === 'COMPLETED') {
                  const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                  const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                  return dateA - dateB;
                }
                
                return b.progress - a.progress;
              }
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
      });
    });
  }
}
