import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../../services/challenge.service';
import { AuthService } from '../../../services/auth.service';
import { ChallengeDetail } from '../../../models/challenge.models';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChallengeImagePipe } from '../shared/pipes/challenge-image.pipe';
import { ProgressColorPipe } from '../shared/pipes/progress-color.pipe';
import { ChallengeStatusBadgeComponent } from '../shared/components/status-badge/challenge-status-badge.component';
import { getDaysRemaining } from '../shared/utils/date.utils';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChallengeImagePipe, ProgressColorPipe, ChallengeStatusBadgeComponent],
  templateUrl: './challenge-detail-page.component.html',
  styleUrl: './challenge-detail-page.component.css'
})
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

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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
    this.customAmount = null;
    this.showProgressModal = true;
  }

  submitQuickCount(amount: number): void {
    this.submitProgress(amount);
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
  }

  submitCustomProgress(): void {
    if (this.customAmount && this.customAmount > 0) {
      this.submitProgress(this.customAmount);
      this.closeProgressModal();
    }
  }

  private submitProgress(amount: number): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    this.isActionLoading = true;
    this.challengeService.updateProgress(this.challenge.id, amount)
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

  get communityProgressPercentage(): number {
    if (!this.challenge) return 0;
    const totalTarget = this.challenge.targetValue * (this.challenge.participantCount && this.challenge.participantCount > 0 ? this.challenge.participantCount : 1);
    const p = ((this.challenge.communityProgress || 0) / totalTarget) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  get progressPercentage(): number {
    if (!this.challenge || !this.challenge.userProgress) return 0;
    const p = (this.challenge.userProgress.progress / this.challenge.targetValue) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  getDaysRemaining(): number {
    return getDaysRemaining(this.challenge?.endDate || '');
  }

  Math = Math;
}
