import { Component, Input, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap, catchError, of, finalize } from 'rxjs';
import { AdminChallengeService } from '../../../services/admin-challenge.service';
import { ChallengeParticipant } from '../../../../../../models/challenge.models';
import { PageableResponse } from '../../../../../../models/carbon.models';
import { EmptyStateComponent } from '../../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../../../../shared/ui/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-library-participants',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmptyStateComponent, LoadingSkeletonComponent],
  template: `
    <div class="participants-panel">
      <div class="panel-header">
        <h3>Participants Summary</h3>
        <p class="summary-text" *ngIf="!loading() && !apiError()">
          Total Participants: <strong>{{ totalElements() }}</strong> 
        </p>
      </div>

      <div *ngIf="apiError()" class="error-banner">
        Failed to load participants. <button (click)="refresh()">Retry</button>
      </div>

      <app-loading-skeleton *ngIf="loading() && !apiError()" type="table"></app-loading-skeleton>

      <ng-container *ngIf="!loading() && !apiError()">
        <app-empty-state 
          *ngIf="participants().length === 0"
          title="No Participants"
          description="No users have joined this challenge yet."
          theme="admin">
        </app-empty-state>

        <div class="table-responsive" *ngIf="participants().length > 0">
          <table class="participants-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Joined At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of participants()">
                <td class="fw-medium">
                  <div class="user-info">
                    <div class="avatar-placeholder">{{ (p.userName || 'U')[0].toUpperCase() }}</div>
                    <span>{{ p.userName || 'User #' + p.userId }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="p.status.toLowerCase()">{{ formatStatus(p.status) }}</span>
                </td>
                <td class="progress-cell">
                  <span class="progress-val">{{ p.progress }}</span>
                </td>
                <td class="date-cell">{{ p.joinedAt | date:'mediumDate' }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="pagination-controls" *ngIf="totalElements() > pageSize">
            <button [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">Previous</button>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">Next</button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .participants-panel {
      padding: 2rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border-radius: 12px;
      margin-top: 1rem;
    }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .panel-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.025em; }
    .summary-text { margin: 0; color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
    
    .table-responsive { width: 100%; overflow-x: auto; background: var(--bg-surface); border-radius: 10px; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .participants-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
    .participants-table th { padding: 1rem 1.25rem; background: var(--bg-surface-hover); color: var(--text-muted); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border-color); }
    .participants-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.9rem; vertical-align: middle; }
    .participants-table tbody tr:hover { background-color: var(--bg-surface-hover); transition: background-color 0.2s ease; }
    .participants-table tr:last-child td { border-bottom: none; }
    
    .user-info { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; color: var(--text-primary); }
    .avatar-placeholder { width: 32px; height: 32px; border-radius: 50%; background: var(--color-purple-light); color: var(--color-purple); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
    .progress-val { font-variant-numeric: tabular-nums; font-weight: 500; color: var(--text-primary); }
    .date-cell { color: var(--text-muted); }
    
    .status-badge { font-size: 0.75rem; padding: 0.35rem 0.75rem; border-radius: 9999px; font-weight: 600; letter-spacing: 0.025em; display: inline-flex; align-items: center; justify-content: center; }
    /* In dark theme, these will need adjustments or variables can be used. For now, keep as is or use global status colors if available. Assuming these light colors are okay or will be overridden by global dark theme rules if needed. */
    .status-badge.active { background: #dcfce3; color: #166534; }
    .status-badge.completed { background: #dbeafe; color: #1e40af; }
    .status-badge.dropped { background: #fee2e2; color: #991b1b; }
    .status-badge.failed { background: #fef08a; color: #854d0e; }
    .status-badge.within_budget { background: #e0e7ff; color: #3730a3; }
    .status-badge.exceeded { background: #ffedd5; color: #9a3412; }
    
    .pagination-controls { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: var(--bg-surface-hover); border-top: 1px solid var(--border-color); justify-content: flex-end; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }
    .pagination-controls button { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: var(--bg-surface); border-radius: 6px; cursor: pointer; color: var(--text-secondary); font-weight: 500; transition: all 0.2s; }
    .pagination-controls button:hover:not(:disabled) { background: var(--bg-surface-hover); border-color: var(--text-muted); color: var(--text-primary); }
    .pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }

    .error-banner { color: var(--text-primary); background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-weight: 500; }
    .error-banner button { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; color: var(--text-primary); padding: 0.35rem 1rem; font-weight: 600; transition: all 0.2s; }
    .error-banner button:hover { background: var(--bg-surface-hover); }
  `]
})
export class LibraryParticipantsComponent implements OnInit {
  @Input({ required: true }) challengeId!: number;

  private challengeService = inject(AdminChallengeService);
  private destroyRef = inject(DestroyRef);

  participants = signal<ChallengeParticipant[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = 5;

  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);

  private fetchSubject = new BehaviorSubject<number>(0);

  ngOnInit() {
    this.fetchSubject.pipe(
      switchMap(page => {
        this.loading.set(true);
        this.apiError.set(false);
        return this.challengeService.getChallengeParticipants(this.challengeId, page, this.pageSize).pipe(
          catchError(() => {
            this.apiError.set(true);
            return of(null);
          }),
          finalize(() => this.loading.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: PageableResponse<ChallengeParticipant> | null) => {
      if (res) {
        this.participants.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.number);
      }
    });
  }

  refresh() {
    this.fetchSubject.next(this.currentPage());
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.fetchSubject.next(page);
    }
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
}
