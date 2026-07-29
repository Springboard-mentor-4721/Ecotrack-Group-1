import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChallengeService } from '../../../services/challenge.service';
import { ChallengeDetail } from '../../../models/challenge.models';
import { LoadingSkeletonComponent } from '../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  templateUrl: './challenge-detail-page.component.html',
  styleUrl: './challenge-detail-page.component.css'
})
export class ChallengeDetailPageComponent implements OnInit {
  isLoading = true;
  isActionLoading = false;
  challenge: ChallengeDetail | null = null;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
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
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.challenge = res;
        },
        error: (err) => {
          console.error('Failed to load challenge detail', err);
          this.error = true;
        }
      });
  }

  joinChallenge(): void {
    if (!this.challenge) return;
    this.isActionLoading = true;
    this.challengeService.joinChallenge(this.challenge.id)
      .pipe(finalize(() => this.isActionLoading = false))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
            this.challenge.participantCount++;
          }
        },
        error: (err) => console.error('Failed to join challenge', err)
      });
  }

  updateProgress(): void {
    if (!this.challenge || !this.challenge.userProgress) return;
    this.isActionLoading = true;
    this.challengeService.updateProgress(this.challenge.id, 1)
      .pipe(finalize(() => this.isActionLoading = false))
      .subscribe({
        next: (participant) => {
          if (this.challenge) {
            this.challenge.userProgress = participant;
          }
        },
        error: (err) => console.error('Failed to update progress', err)
      });
  }

  get progressPercentage(): number {
    if (!this.challenge || !this.challenge.userProgress) return 0;
    const p = (this.challenge.userProgress.progress / this.challenge.targetValue) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-light text-emerald';
      case 'PENDING': return 'bg-yellow-light text-yellow-600';
      case 'COMPLETED': return 'bg-blue-light text-blue';
      case 'CLOSED': 
      case 'ARCHIVED': return 'bg-slate-200 text-slate-700';
      default: return 'bg-surface text-secondary';
    }
  }

  Math = Math;
}
