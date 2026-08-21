import { Component, OnInit, signal, computed } from '@angular/core';
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
  isLoading = signal(true);
  isActionLoading = signal(false);
  challenge = signal<ChallengeDetail | null>(null);
  relatedChallenges = signal<any[]>([]);
  error = signal(false);
  actionError = signal<string | null>(null);

  // Custom Progress Input
  showProgressModal = signal(false);
  customAmount = signal<number | null>(null);
  isAdminUser = signal(false);
  currentMilestone = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdminUser.set(this.authService.isAdmin());
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadChallenge(Number(id));
        window.scrollTo(0, 0); // scroll to top when changing challenge
      } else {
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  navigateBack(): void {
    if (this.isAdminUser()) {
      this.router.navigate(['/admin/challenges']);
    } else {
      this.router.navigate(['/challenges']);
    }
  }

  loadChallenge(id: number): void {
    this.isLoading.set(true);
    this.error.set(false);
    this.challengeService.getChallengeDetail(id)
      .pipe(finalize(() => {
        this.isLoading.set(false);
        }))
      .subscribe({
        next: (res) => {
          this.challenge.set(res);
          // Load related
          this.challengeService.getChallenges(0, 5).subscribe({
            next: (listRes) => {
              this.relatedChallenges.set(listRes.content.filter((c: any) => c.id !== res.id).slice(0, 3));
              }
          });
          },
        error: (err) => {
          console.error('Failed to load challenge detail', err);
          this.error.set(true);
          }
      });
  }

  joinChallenge(): void {
    if (!this.challenge()) return;
    this.isActionLoading.set(true);
    this.challengeService.joinChallenge(this.challenge()!.id)
      .pipe(finalize(() => {
        this.isActionLoading.set(false);
        }))
      .subscribe({
        next: (participant) => {
          this.challenge.update(c => { if (c) { c.userProgress = participant; c.participantCount++; } return c; });
          this.actionError.set(null);
          },
        error: (err) => {
          console.error('Failed to join challenge', err);
          this.actionError.set('Failed to join the challenge. Please try again.');
          }
      });
  }

  openProgressModal(): void {
    if (!this.challenge() || !this.challenge()!.userProgress) return;
    this.showProgressModal.set(true);
    this.customAmount.set(null);
  }

  isModalAmountValid = computed(() => this.customAmount() !== null && this.customAmount()! > 0);

  closeProgressModal(): void {
    this.showProgressModal.set(false);
  }

  submitProgress(amount: number): void {
    if (!this.challenge() || !this.challenge()!.userProgress) return;

    const currentProgress = this.challenge()!.userProgress?.progress || 0;
    const target = this.challenge()!.targetValue || 0;
    const remaining = target - currentProgress;
    const cappedAmount = Math.min(amount, remaining > 0 ? remaining : amount);

    if (cappedAmount <= 0) return;

    this.isActionLoading.set(true);
    this.challengeService.updateProgress(this.challenge()!.id, cappedAmount)
      .pipe(finalize(() => {
        this.isActionLoading.set(false);
        }))
      .subscribe({
        next: (participant) => {
          this.challenge.update(c => { if (c) { c.userProgress = participant; } return c; });
          this.actionError.set(null);
          },
        error: (err) => {
          console.error('Failed to update progress', err);
          this.actionError.set('Failed to submit progress. Please try again.');
          }
      });
  }

  onMilestoneReached(percentage: number): void {
    this.currentMilestone.set(percentage);
  }

  onToastDismissed(): void {
    this.currentMilestone.set(null);
  }

  communityProgressPercentage = computed(() => {
    if (!this.challenge()) return 0;
    const totalTarget = this.challenge()!.targetValue * (this.challenge()!.participantCount && this.challenge()!.participantCount > 0 ? this.challenge()!.participantCount : 1);
    if (totalTarget === 0) {
      return (this.challenge()!.globalProgress || 0) > 0 ? 100 : 0;
    }
    const p = ((this.challenge()!.globalProgress || 0) / totalTarget) * 100;
    return Math.min(Math.max(p, 0), 100);
  });

  daysRemaining = computed(() => getDaysRemaining(this.challenge()?.endDate || ''));

}
