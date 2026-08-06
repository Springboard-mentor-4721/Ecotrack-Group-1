import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/services/confirmation-dialog.service';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-admin-challenge-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-detail-container">
      <div class="header d-flex justify-content-between align-items-center mb-4">
        <div>
          <button class="btn btn-icon mb-2" routerLink="/admin/challenges">
            <span class="material-icons">arrow_back</span> Back to Library
          </button>
          <h1 class="mb-1" style="font-size: 1.8rem; font-weight: 700; color: #0f172a;">Challenge Details</h1>
        </div>
        <div class="actions d-flex gap-2" *ngIf="challenge() as c">
          <button class="btn btn-outline" *ngIf="c.status === 'PENDING' || c.status === 'UPCOMING'" (click)="editChallenge(c.id)">
            <span class="material-icons text-primary">edit</span> Edit
          </button>
          <button class="btn btn-outline" *ngIf="c.status === 'PENDING'" (click)="approveChallenge(c)">
            <span class="material-icons text-success">check_circle</span> Approve
          </button>
          <button class="btn btn-outline" *ngIf="c.status === 'PENDING'" (click)="rejectChallenge(c)">
            <span class="material-icons text-danger">cancel</span> Reject
          </button>
          <button class="btn btn-outline" *ngIf="c.status !== 'ARCHIVED'" (click)="archiveChallenge(c)">
            <span class="material-icons text-secondary">archive</span> Archive
          </button>
        </div>
      </div>

      <div *ngIf="loading()" class="d-flex justify-content-center my-5">
        <div class="spinner-border text-success" role="status"></div>
      </div>

      <div *ngIf="apiError()" class="alert alert-danger my-5">
        Failed to load challenge details.
      </div>

      <div class="detail-card" *ngIf="!loading() && !apiError() && challenge() as c">
        <div class="status-banner" [ngClass]="'banner-' + c.status">
          <span class="fw-bold">{{ c.status === 'PENDING' ? 'Draft' : (c.status | titlecase) }}</span>
        </div>
        
        <div class="challenge-image-banner" [style.background]="c.imageUrl ? 'url(' + resolveImageUrl(c.imageUrl) + ') center/cover no-repeat' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)'">
        </div>
        
        <div class="p-4 p-md-5">
          <div class="row mb-4">
            <div class="col-12 col-md-8">
              <span class="badge bg-light text-dark border px-2 py-1 mb-2">{{ c.typeCode }}</span>
              <h2 class="fw-bolder mb-3" style="font-size: 2.2rem;">{{ c.title }}</h2>
              <p class="text-muted fs-5 lh-base">{{ c.description }}</p>
            </div>
            <div class="col-12 col-md-4 text-md-end">
              <div class="bg-light rounded p-3 text-center border">
                <span class="d-block text-muted text-uppercase fw-bold fs-sm mb-1">XP Reward</span>
                <span class="d-block fw-bolder text-dark" style="font-size: 2rem;">{{ c.rewardXp }}</span>
              </div>
            </div>
          </div>
          
          <div class="row g-4 mb-4">
            <div class="col-6 col-md-3">
              <div class="info-block border rounded p-3 h-100">
                <span class="text-muted fs-sm fw-bold text-uppercase d-block mb-1">Start Date</span>
                <span class="fw-bold fs-5">{{ c.startDate | date:'dd MMM yyyy' }}</span>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="info-block border rounded p-3 h-100">
                <span class="text-muted fs-sm fw-bold text-uppercase d-block mb-1">End Date</span>
                <span class="fw-bold fs-5">{{ c.endDate | date:'dd MMM yyyy' }}</span>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="info-block border rounded p-3 h-100">
                <span class="text-muted fs-sm fw-bold text-uppercase d-block mb-1">Target</span>
                <span class="fw-bold fs-5">{{ c.targetValue }} {{ c.progressType === 'COUNT' ? 'Entries' : 'Units' }}</span>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="info-block border rounded p-3 h-100">
                <span class="text-muted fs-sm fw-bold text-uppercase d-block mb-1">Participants</span>
                <span class="fw-bold fs-5">{{ c.participantCount || 0 }}</span>
              </div>
            </div>
          </div>
          
          <div class="row g-4">
            <div class="col-12 col-md-6">
              <div class="info-block border rounded p-4 h-100 bg-light">
                <h5 class="fw-bolder mb-3">Community Progress</h5>
                <div class="d-flex justify-content-between mb-2">
                  <span class="fw-bold">{{ c.communityProgress || 0 }} Achieved</span>
                  <span class="fw-bold text-success">{{ getCompletionPercent(c) }}%</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div class="progress-bar bg-success" [style.width.%]="getCompletionPercent(c)"></div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
               <div class="info-block border rounded p-4 h-100 bg-light">
                  <h5 class="fw-bolder mb-3">Settings & Rules</h5>
                  <div class="d-flex flex-column gap-2">
                     <div class="d-flex justify-content-between border-bottom pb-2">
                        <span class="text-muted">Tracking Method</span>
                        <span class="fw-bold">{{ c.trackingMethod }}</span>
                     </div>
                     <div class="d-flex justify-content-between">
                        <span class="text-muted">Category ID</span>
                        <span class="fw-bold">{{ c.linkedCategoryId || 'N/A' }}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-detail-container { padding: 2rem 2.5rem; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-icon { background: none; color: #64748b; padding: 0; font-weight: 600; font-size: 0.9rem; }
    .btn-icon:hover { color: #0f172a; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
    .btn-outline:hover:not([disabled]) { background: #f1f5f9; }
    .btn-outline[disabled] { opacity: 0.5; cursor: not-allowed; }
    
    .detail-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .status-banner { padding: 0.5rem 1.5rem; color: white; text-align: center; letter-spacing: 1px; font-size: 0.85rem; }
    .banner-ACTIVE { background: #10b981; }
    .banner-PENDING { background: #f59e0b; }
    .banner-COMPLETED { background: #8b5cf6; }
    .banner-ARCHIVED { background: #64748b; }
    .banner-UPCOMING { background: #3b82f6; }
    .banner-CLOSED { background: #ef4444; }
    .challenge-image-banner { height: 250px; width: 100%; border-bottom: 1px solid #e2e8f0; }
  `]
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private dialog = inject(ConfirmationDialogService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  challenge = signal<ChallengeDetail | null>(null);
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return encodeURI(url);
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    if (url.startsWith('uploads/')) {
      return encodeURI(`${baseUrl}/${url}`);
    }
    return encodeURI(`${baseUrl}/uploads/${url}`);
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        this.loadChallenge(numericId);
      } else {
        this.apiError.set(true);
        this.loading.set(false);
      }
    } else {
      this.apiError.set(true);
      this.loading.set(false);
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
          this.cdr.markForCheck();
        }
      });
  }

  getCompletionPercent(c: ChallengeDetail): number {
    if (!c.targetValue) return 0;
    const p = Math.round(((c.communityProgress || 0) / c.targetValue) * 100);
    return p > 100 ? 100 : p;
  }

  editChallenge(id: number) {
    this.router.navigate(['/admin/challenges', id, 'edit']);
  }

  duplicateChallenge(c: ChallengeDetail) {
    this.toast.info('Preparing duplicate...');
    const duplicateData = this.challengeService.buildDuplicatePayload(c);
    this.router.navigate(['/admin/challenges/create/wizard'], { 
      state: { duplicateData, originalName: c.title }
    });
  }

  approveChallenge(c: ChallengeDetail) {
    this.challengeService.moderateChallenge(c.id, 'APPROVE').subscribe({
      next: () => {
        this.toast.success(`Challenge approved.`);
        this.loadChallenge(c.id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to approve challenge.';
        this.toast.error(msg);
        this.cdr.markForCheck();
      }
    });
  }

  rejectChallenge(c: ChallengeDetail) {
    this.dialog.confirm(`Are you sure you want to reject "${c.title}"?`).then((res: boolean) => {
      if (res) {
        this.challengeService.moderateChallenge(c.id, 'REJECT').subscribe({
          next: () => {
            this.toast.success(`Challenge rejected.`);
            this.router.navigate(['/admin/challenges']);
          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to reject challenge.';
            this.toast.error(msg);
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  archiveChallenge(c: ChallengeDetail) {
    this.dialog.confirm(`Are you sure you want to archive "${c.title}"?`).then((res: boolean) => {
      if (res) {
        this.challengeService.archiveChallenge(c.id).subscribe({
          next: () => {
            this.toast.success(`Challenge archived.`);
            this.loadChallenge(c.id);
            this.cdr.markForCheck();
          },
          error: () => {
            this.toast.error('Failed to archive challenge.');
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}
