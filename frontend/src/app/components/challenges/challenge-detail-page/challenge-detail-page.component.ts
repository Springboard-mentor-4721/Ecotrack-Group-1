import { Component, OnInit, ChangeDetectorRef } from '@angular/core';  
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../services/challenge.service';
import { AuthService } from '../../../services/auth.service';
import { ChallengeDetail } from '../../../models/challenge.models';
import { finalize } from 'rxjs/operators';

import { getDaysRemaining } from '../shared/utils/date.utils';
import { ChallengeHeroComponent } from './components/hero/challenge-hero.component';
import { ChallengeActionsPanelComponent } from './components/actions/challenge-actions-panel.component';
import { ManualProgressModalComponent } from './components/progress-modal/manual-progress-modal.component';
import { ChallengeCardComponent } from '../shared/components/challenge-card/challenge-card.component';
import { CommunityImpactWidgetComponent } from './components/community-impact-widget/community-impact-widget.component';
import { ChallengeRulesWidgetComponent } from './components/challenge-rules-widget/challenge-rules-widget.component';
import { RewardWidgetComponent } from './components/reward-widget/reward-widget.component';
import { ChallengeQuickStatsWidgetComponent } from './components/challenge-quick-stats-widget/challenge-quick-stats-widget.component';
import { MilestoneToastComponent } from '../shared/components/milestone-toast/milestone-toast.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChallengeHeroComponent, ChallengeActionsPanelComponent, ManualProgressModalComponent, ChallengeCardComponent, ChallengeRulesWidgetComponent, RewardWidgetComponent, ChallengeQuickStatsWidgetComponent, MilestoneToastComponent],
  templateUrl: './challenge-detail-page.component.html',
  styleUrl: './challenge-detail-page.component.css'
})
// ARCHITECTURE NOTE (Phase 1 Container/Presentational):
// This component acts as the 'Container' for the Challenge Detail feature.
// It is solely responsible for router state, API orchestration (via ChallengeService),
// and state management. All child components (except LeaderboardWidgetComponent) 
// are 'Presentational' and communicate exclusively via @Input() and @Output().
export class ChallengeDetailPageComponent implements OnInit {
  isLoading = true;
  isActionLoading = false;
  challenge: ChallengeDetail | null = null;
  relatedChallenges: any[] = [];
  error = false;
  
  // Custom Progress Input
  showProgressModal = false;
  customAmount: number | null = null;
  isAdminUser = false;
  currentMilestone: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdminUser = this.authService.isAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChallenge(Number(id));
    } else {
      this.error = true;
      this.isLoading = false;
    }
  }

  navigateBack(): void {
    if (this.isAdminUser) {
      this.router.navigate(['/admin/challenges']);
    } else {
      this.router.navigate(['/challenges']);
    }
  }

  loadChallenge(id: number): void {
    this.isLoading = true;
    this.error = false;
    this.challengeService.getChallengeDetail(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.challenge = res;
          // Load related
          this.challengeService.getChallenges(0, 5).subscribe({
            next: (listRes) => {
              this.relatedChallenges = listRes.content.filter(c => c.id !== res.id).slice(0, 3);
              this.cdr.detectChanges();
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load challenge detail', err);
          this.error = true;
          this.cdr.detectChanges();
        }
      });
  }

  joinChallenge(): void {
    if (!this.challenge) return;
    this.isActionLoading = true;
    this.challengeService.joinChallenge(this.challenge.id)
      .pipe(finalize(() => {
        this.isActionLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
            this.challenge.participantCount++;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to join challenge', err);
          this.cdr.detectChanges();
        }
      });
  }

  openProgressModal(): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    this.showProgressModal = true;
    this.customAmount = null;
  }

  get isModalAmountValid(): boolean {
    return this.customAmount !== null && this.customAmount > 0;
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
  }

  submitProgress(amount: number): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    
    const currentProgress = this.challenge.userProgress.progress || 0;
    const target = this.challenge.targetValue || 0;
    const remaining = target - currentProgress;
    const cappedAmount = Math.min(amount, remaining > 0 ? remaining : amount);
    
    if (cappedAmount <= 0) return;

    this.isActionLoading = true;
    this.challengeService.updateProgress(this.challenge.id, cappedAmount)
      .pipe(finalize(() => {
        this.isActionLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update progress', err);
          this.cdr.detectChanges();
        }
      });
  }

  onMilestoneReached(percentage: number): void {
    this.currentMilestone = percentage;
  }

  onToastDismissed(): void {
    this.currentMilestone = null;
  }

  get communityProgressPercentage(): number {
    if (!this.challenge) return 0;
    const totalTarget = this.challenge.targetValue * (this.challenge.participantCount && this.challenge.participantCount > 0 ? this.challenge.participantCount : 1);
    const p = ((this.challenge.communityProgress || 0) / totalTarget) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  getDaysRemaining(): number {
    return getDaysRemaining(this.challenge?.endDate || '');
  }

}
