import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { LibraryParticipantsComponent } from '../library/components/library-participants.component';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-challenge-participants-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LibraryParticipantsComponent],
  template: `
    <div class="admin-detail-container">
      <div class="header d-flex justify-content-between align-items-center mb-4">
        <div>
          <button class="btn btn-icon mb-2" [routerLink]="['/admin/challenges', challengeId()]">
            <span class="material-icons">arrow_back</span> Back to Challenge
          </button>
          <h1 class="mb-1" style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary);">Challenge Participants</h1>
          <p class="text-muted" *ngIf="challenge()">{{ challenge()?.title }}</p>
        </div>
      </div>

      <div *ngIf="loading()" class="d-flex justify-content-center my-5">
        <div class="spinner-border text-success" role="status"></div>
      </div>

      <div *ngIf="apiError()" class="alert alert-danger my-5">
        Failed to load challenge details.
      </div>

      <div class="detail-card" *ngIf="!loading() && !apiError() && challengeId()">
        <app-library-participants [challengeId]="challengeId()!"></app-library-participants>
      </div>
    </div>
  `,
  styles: [`
    .admin-detail-container { padding: 2rem 2.5rem; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-icon { background: none; color: var(--text-muted); padding: 0; font-weight: 600; font-size: 0.9rem; }
    .btn-icon:hover { color: var(--text-primary); }
    
    .detail-card { background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

    .text-dark { color: var(--text-primary) !important; }
    .text-muted { color: var(--text-muted) !important; }
    .bg-light { background-color: var(--bg-surface-hover) !important; }
    .border-bottom { border-color: var(--border-color) !important; }
  `]
})
export class ParticipantsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private challengeService = inject(AdminChallengeService);
  private destroyRef = inject(DestroyRef);

  challengeId = signal<number | null>(null);
  challenge = signal<ChallengeDetail | null>(null);
  loading = signal<boolean>(false);
  apiError = signal<boolean>(false);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        this.challengeId.set(numericId);
        this.loadChallenge(numericId);
      }
    }
  }

  loadChallenge(id: number) {
    this.loading.set(true);
    this.apiError.set(false);
    this.challengeService.getChallengeDetail(id)
      .pipe(
        catchError(() => {
          this.apiError.set(true);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res) {
          this.challenge.set(res);
        }
      });
  }
}
