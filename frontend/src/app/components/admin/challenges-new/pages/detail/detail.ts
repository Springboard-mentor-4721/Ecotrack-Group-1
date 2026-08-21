import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef  } from '@angular/core';
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
import { CarbonEntryService } from '../../../../../services/carbon-entry.service';
import { CarbonCategory } from '../../../../../models/carbon-category.models';
import { DEFAULT_CHALLENGE_TEMPLATES } from '../../challenge-default-templates';

@Component({
  selector: 'app-admin-challenge-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-detail-container">
      <div class="header-container mb-4" *ngIf="challenge() as c">
        <div class="header-title-area">
          <button class="btn btn-icon mb-2" routerLink="/admin/challenges">
            <span class="material-icons">arrow_back</span> Back to Library
          </button>
          <h1 class="mb-1" style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary);">Challenge Details</h1>
        </div>
        <div class="actions-area">
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
              <span class="badge bg-light text-dark border px-2 py-1 mb-2">{{ formatProgressMetric(c.progressMetric) }}</span>
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
                <span class="text-muted fs-sm fw-bold text-uppercase d-block mb-1">{{ c.challengeEvaluationType === 'BUDGET' ? 'Budget' : 'Target' }}</span>
                <span class="fw-bold fs-5">{{ c.targetValue }} {{ getUnit(c) }}</span>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="info-block border rounded p-3 h-100 participants-block" [routerLink]="['/admin/challenges', c.id, 'participants']">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted fs-sm fw-bold text-uppercase d-block">Participants</span>
                  <span class="material-icons fs-6 text-muted link-icon">arrow_forward</span>
                </div>
                <span class="fw-bold fs-5 text-primary">{{ c.participantCount || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-12">
               <div class="info-block border rounded p-4 h-100 bg-light">
                  <h5 class="fw-bolder mb-3">Settings & Rules</h5>
                  <div class="d-flex flex-column gap-2">
                     <div class="d-flex justify-content-between border-bottom pb-2">
                        <span class="text-muted">Type</span>
                        <span class="fw-bold">
                          <span class="badge" [ngClass]="c.challengeEvaluationType === 'ACHIEVEMENT' ? 'bg-primary' : 'bg-warning text-dark'">
                            {{ c.challengeEvaluationType || 'ACHIEVEMENT' }}
                          </span>
                        </span>
                     </div>
                     <div class="d-flex justify-content-between border-bottom pb-2 mt-2">
                        <span class="text-muted">Tracking Method</span>
                        <span class="fw-bold">{{ c.trackingMethod }}</span>
                     </div>
                     <div class="d-flex justify-content-between border-bottom pb-2 mt-2">
                        <span class="text-muted">Category</span>
                        <span class="fw-bold">{{ getCategoryName(c) }}</span>
                     </div>
                     <div class="d-flex justify-content-between mt-2" *ngIf="c.trackingMethod === 'AUTOMATIC'">
                        <span class="text-muted">Allowed Data Sources</span>
                        <span class="fw-bold text-end">{{ getSubcategoryNames(c) }}</span>
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
    .admin-detail-container { padding: 2rem 2.5rem; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-icon { background: none; color: var(--text-muted); padding: 0; font-weight: 600; font-size: 0.9rem; }
    .btn-icon:hover { color: var(--text-primary); }
    .btn-outline { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); }
    .btn-outline:hover:not([disabled]) { background: var(--bg-surface-hover); }
    .btn-outline[disabled] { opacity: 0.5; cursor: not-allowed; }

    .participants-block { cursor: pointer; transition: all 0.2s ease; text-decoration: none; display: block; }
    .participants-block:hover { background-color: var(--bg-surface-hover); border-color: var(--border-color) !important; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .participants-block .link-icon { transition: transform 0.2s ease; }
    .participants-block:hover .link-icon { color: var(--text-primary) !important; transform: translateX(2px); }

    .detail-card { background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .status-banner { padding: 0.5rem 1.5rem; color: white; text-align: center; letter-spacing: 1px; font-size: 0.85rem; }
    .banner-ACTIVE { background: #10b981; }
    .banner-PENDING { background: #f59e0b; }
    .banner-COMPLETED { background: #8b5cf6; }
    .banner-ARCHIVED { background: #64748b; }
    .banner-UPCOMING { background: #3b82f6; }
    .banner-CLOSED { background: #ef4444; }
    .challenge-image-banner { height: 350px; width: 100%; border-bottom: 1px solid var(--border-color); }
    
    .header-container { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .actions-area { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    
    @media (max-width: 768px) {
      .admin-detail-container { padding: 1.5rem 1rem; }
      .challenge-image-banner { height: 200px; }
      .header-container { flex-direction: column; align-items: flex-start; }
    }
    
    .info-block.bg-light { background-color: var(--bg-surface-hover) !important; border-color: var(--border-color) !important; color: var(--text-primary); }
    .bg-light { background-color: var(--bg-surface-hover) !important; }
    .text-dark { color: var(--text-primary) !important; }
    .text-muted { color: var(--text-muted) !important; }
    .border { border-color: var(--border-color) !important; }
  `]
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(AdminChallengeService);
  private carbonService = inject(CarbonEntryService);
  private toast = inject(ToastService);
  private dialog = inject(ConfirmationDialogService);
  private destroyRef = inject(DestroyRef);


  challenge = signal<ChallengeDetail | null>(null);
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);
  categories = signal<CarbonCategory[]>([]);

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
    this.carbonService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.categories.set(cats);
    });

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

  getCategoryName(c: ChallengeDetail): string {
    if (c.linkedCategoryId) {
      const cat = this.categories().find(cat => cat.id === c.linkedCategoryId);
      if (cat) return cat.name;
    }
    const template = DEFAULT_CHALLENGE_TEMPLATES.find(t => t.title === c.title);
    if (template && template.category) {
      return template.category;
    }
    return 'Not assigned';
  }

  getSubcategoryNames(c: ChallengeDetail): string {
    if (c.linkedCategoryId && c.rulesConfig?.allowedSubcategoryIds && c.rulesConfig.allowedSubcategoryIds.length > 0) {
      const cat = this.categories().find(cat => cat.id === c.linkedCategoryId);
      if (cat && cat.subcategories) {
        const names = c.rulesConfig.allowedSubcategoryIds
          .map(id => cat.subcategories!.find(s => s.id === id)?.name)
          .filter(name => !!name);
        if (names.length > 0) return names.join(', ');
      }
    }
    const template = DEFAULT_CHALLENGE_TEMPLATES.find(t => t.title === c.title);
    if (template && template.trackingSources && template.trackingSources.length > 0) {
      return template.trackingSources.map(s => s.replace(/_/g, ' ')).map(s => s.charAt(0) + s.slice(1).toLowerCase()).join(', ');
    }
    return 'All subcategories allowed';
  }

  getUnit(c: ChallengeDetail): string {
    if (c.derivedUnit) return c.derivedUnit;
    const template = DEFAULT_CHALLENGE_TEMPLATES.find(t => t.title === c.title);
    if (template && template.goalUnit) return template.goalUnit;
    return c.progressMetric === 'ENTRY_COUNT' ? 'entries' : (c.progressMetric === 'CARBON_EMISSION' ? 'kg CO₂' : 'units');
  }

  formatProgressMetric(metric: string): string {
    if (!metric) return '';
    return metric === 'ENTRY_COUNT' ? 'Entry Count' : (metric === 'CARBON_EMISSION' ? 'Carbon Emission' : (metric === 'QUANTITY' ? 'Quantity' : metric));
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

  getCompletionPercent(c: ChallengeDetail): number {
    if (!c.targetValue) return 0;
    const p = c.targetValue > 0 ? Math.round(((c.globalProgress || 0) / c.targetValue) * 100) : ((c.globalProgress || 0) > 0 ? 100 : 0);
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
    this.dialog.confirm(`Are you sure you want to approve "${c.title}"?`).then((res: boolean) => {
      if (res) {
        this.challengeService.moderateChallenge(c.id, 'APPROVE').subscribe({
          next: () => {
            this.toast.success(`Challenge approved.`);
            this.loadChallenge(c.id);

          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to approve challenge.';
            this.toast.error(msg);

          }
        });
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

          },
          error: () => {
            this.toast.error('Failed to archive challenge.');

          }
        });
      }
    });
  }
}
