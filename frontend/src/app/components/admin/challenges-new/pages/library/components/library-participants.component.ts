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
                <th>User ID</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Joined At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of participants()">
                <td>#{{ p.userId }}</td>
                <td>
                  <span class="status-badge" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span>
                </td>
                <td>{{ p.progress }}</td>
                <td>{{ p.joinedAt | date:'mediumDate' }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="pagination-controls" *ngIf="totalElements() > pageSize">
            <button [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">Prev</button>
            <span class="page-info">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">Next</button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .participants-panel {
      padding: 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .panel-header h3 { margin: 0; font-size: 1.125rem; color: #0f172a; }
    .summary-text { margin: 0; color: #475569; font-size: 0.9375rem; }
    
    .table-responsive { width: 100%; overflow-x: auto; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
    .participants-table { width: 100%; border-collapse: collapse; text-align: left; }
    .participants-table th { padding: 0.75rem 1rem; background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.8125rem; border-bottom: 1px solid #e2e8f0; }
    .participants-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.875rem; }
    .participants-table tr:last-child td { border-bottom: none; }
    
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 500; }
    .status-badge.active { background: #dcfce3; color: #166534; }
    .status-badge.completed { background: #dbeafe; color: #1e40af; }
    
    .pagination-controls { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-top: 1px solid #e2e8f0; justify-content: flex-end; }
    .pagination-controls button { padding: 0.25rem 0.75rem; border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; color: #475569; }
    .pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 0.875rem; color: #475569; }

    .error-banner { color: #991b1b; background: #fee2e2; padding: 0.75rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    .error-banner button { background: white; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; color: #991b1b; padding: 0.25rem 0.75rem; }
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
}
