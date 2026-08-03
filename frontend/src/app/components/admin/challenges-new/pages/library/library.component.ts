import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of } from 'rxjs';
import { AdminChallengeService } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/services/confirmation-dialog.service';
import { Challenge, ChallengeStats } from '../../../../../models/challenge.models';
import { PageableResponse } from '../../../../../models/carbon.models';
import { CHALLENGE_TYPES } from '../../shared/challenge-types.config';
import { CarbonCategory } from '../../../../../models/carbon-category.models';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { LibraryParticipantsComponent } from './components/library-participants.component';

@Component({
  selector: 'app-admin-challenges-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, EmptyStateComponent, LoadingSkeletonComponent, LibraryParticipantsComponent],
  template: `
    <div class="library-container">
      <header class="header">
        <div class="header-left">
          <h1>Challenge Library</h1>
          <p>Manage, monitor and organize all sustainability challenges.</p>
        </div>
        <div class="header-right">
          <button class="btn btn-outline" (click)="toastInfo('Import template feature coming soon.')">
            <span class="material-icons">upload</span> Import Template
          </button>
          <button class="btn btn-outline" (click)="toastInfo('Export feature coming soon.')">
            <span class="material-icons">download</span> Export
          </button>
          <button class="btn btn-primary" (click)="createChallenge()">
            <span class="material-icons">add</span> Create Challenge
          </button>
        </div>
      </header>

      <div class="stats-grid" *ngIf="stats() as s">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon icon-total"><span class="material-icons">dashboard</span></div>
            <span class="stat-title">Total Challenges</span>
          </div>
          <div class="stat-value">{{ s.totalChallenges }}</div>
          <div class="stat-trend trend-up"><span class="material-icons">arrow_upward</span> 18% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon icon-active"><span class="material-icons">check_circle_outline</span></div>
            <span class="stat-title">Active Challenges</span>
          </div>
          <div class="stat-value">{{ s.activeCount }}</div>
          <div class="stat-trend trend-up"><span class="material-icons">arrow_upward</span> 20% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon icon-scheduled"><span class="material-icons">event</span></div>
            <span class="stat-title">Scheduled Challenges</span>
          </div>
          <div class="stat-value">{{ s.scheduledCount }}</div>
          <div class="stat-trend trend-up"><span class="material-icons">arrow_upward</span> 5% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon icon-completed"><span class="material-icons">emoji_events</span></div>
            <span class="stat-title">Completed Challenges</span>
          </div>
          <div class="stat-value">{{ s.completedCount }}</div>
          <div class="stat-trend trend-down"><span class="material-icons">arrow_downward</span> 17% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon icon-archived"><span class="material-icons">inventory_2</span></div>
            <span class="stat-title">Archived Challenges</span>
          </div>
          <div class="stat-value">{{ s.archivedCount }}</div>
          <div class="stat-trend trend-up"><span class="material-icons">arrow_upward</span> 12% vs last month</div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-input">
          <span class="material-icons">search</span>
          <input type="text" [formControl]="searchControl" placeholder="Search challenges..." />
        </div>
        
        <div class="filter-actions">
          <button class="btn btn-outline" style="font-weight: 500; color: #0f172a">
            <span class="material-icons">filter_alt</span> Filter
          </button>
          <select class="filter-dropdown" [formControl]="trackingControl">
            <option value="">Tracking Method</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
          <select class="filter-dropdown" [formControl]="statusControl">
            <option value="">Status</option>
            <option value="PENDING">Pending</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="currentTab() === ''" (click)="setTab('')">All ({{ stats()?.totalChallenges || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'PENDING'" (click)="setTab('PENDING')">Pending</button>
        <button class="tab" [class.active]="currentTab() === 'UPCOMING'" (click)="setTab('UPCOMING')">Scheduled ({{ stats()?.scheduledCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'ACTIVE'" (click)="setTab('ACTIVE')">Active ({{ stats()?.activeCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'COMPLETED'" (click)="setTab('COMPLETED')">Completed ({{ stats()?.completedCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'ARCHIVED'" (click)="setTab('ARCHIVED')">Archived ({{ stats()?.archivedCount || 0 }})</button>
      </div>

      <div class="bulk-bar" *ngIf="selectedIds().size > 0">
        <div class="bulk-selected">
          <span class="material-icons" style="color: #059669">check_circle</span>
          {{ selectedIds().size }} selected
        </div>
        <button class="bulk-btn"><span class="material-icons">archive</span> Archive</button>
        <button class="bulk-btn delete"><span class="material-icons">delete</span> Delete</button>
        <button class="bulk-btn"><span class="material-icons">download</span> Export</button>
        <button class="bulk-btn"><span class="material-icons">content_copy</span> Duplicate</button>
        <button class="btn-icon bulk-close" (click)="clearSelection()"><span class="material-icons">close</span></button>
      </div>

      <div *ngIf="apiError()" class="error-banner" style="display: flex; gap: 1rem; align-items: center; background: #fef2f2; padding: 1rem; color: #dc2626; border-radius: 8px; margin-bottom: 2rem;">
        <span class="material-icons">error_outline</span>
        <p style="margin: 0">Failed to load Challenges. Please try again later.</p>
        <button class="btn btn-outline" (click)="refresh()" style="margin-left: auto; border-color: #fca5a5; color: #dc2626">Retry</button>
      </div>

      <div class="content-area">
        <app-loading-skeleton *ngIf="loading() && !apiError()" type="table"></app-loading-skeleton>

        <ng-container *ngIf="!loading() && !apiError()">
          <app-empty-state 
            *ngIf="challenges().length === 0"
            title="No Challenges Found"
            description="No Challenges match your current filters. Adjust your search or create a new challenge."
            theme="admin">
            <span icon class="material-icons" style="font-size: 3rem;">inventory_2</span>
          </app-empty-state>

          <div class="table-card" *ngIf="challenges().length > 0">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-right: 0">
                      <input type="checkbox" class="custom-checkbox" 
                        [checked]="isAllSelected()" 
                        (change)="toggleAll($event)" />
                    </th>
                    <th>Challenge</th>
                    <th>Category</th>
                    <th>Tracking Method</th>
                    <th>Participants</th>
                    <th>XP Reward</th>
                    <th>Status</th>
                    <th>Date Range</th>
                    <th>Progress</th>
                    <th class="actions-col"></th>
                  </tr>
                </thead>
                <tbody>
                  <ng-container *ngFor="let c of challenges(); trackBy: trackById">
                    <tr [class.archived]="c.status === 'ARCHIVED'" [class.expanded]="expandedRowId() === c.id">
                      <td style="padding-right: 0">
                        <input type="checkbox" class="custom-checkbox" 
                          [checked]="selectedIds().has(c.id)" 
                          (change)="toggleSelection(c.id, $event)" />
                      </td>
                      <td>
                        <div class="campaign-cell">
                          <div class="campaign-icon" [ngStyle]="{'background': getGradient(c.id)}">
                            <span class="material-icons" style="color: white">flag</span>
                          </div>
                          <div class="campaign-info">
                            <span class="campaign-title">{{ c.title }}</span>
                            <span class="campaign-desc">{{ c.description }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="cat-cell" *ngIf="c.trackingMethod === 'AUTOMATIC'">
                          <span class="material-icons">{{ getCategoryIcon(c.linkedCategoryId) }}</span>
                          <span>{{ getCarbonCategoryName(c.linkedCategoryId) }}</span>
                        </div>
                        <div class="cat-cell" *ngIf="c.trackingMethod !== 'AUTOMATIC'">
                          <span class="material-icons">category</span>
                          <span>Manual Setup</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="c.trackingMethod === 'AUTOMATIC' ? 'badge-auto' : 'badge-manual'">
                          {{ c.trackingMethod | titlecase }}
                        </span>
                      </td>
                      <td style="font-weight: 500; color: #0f172a">{{ c.participantCount || 0 | number }}</td>
                      <td style="font-weight: 500; color: #0f172a">{{ c.rewardXp }} XP</td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(c.status)">
                          {{ c.status | titlecase }}
                        </span>
                      </td>
                      <td style="white-space: nowrap">
                        <div style="color: #0f172a; font-weight: 500; font-size: 0.85rem">{{ c.startDate | date:'dd MMM yyyy' }}</div>
                        <div style="color: #64748b; font-size: 0.75rem">{{ c.endDate | date:'dd MMM yyyy' }}</div>
                      </td>
                      <td>
                        <div class="progress-cell">
                          <span class="progress-text">{{ getProgressPercent(c) }}%</span>
                          <div class="progress-bar-bg">
                            <div class="progress-bar-fill" [style.width.%]="getProgressPercent(c)"></div>
                          </div>
                        </div>
                      </td>
                      <td class="actions-cell">
                        <button class="btn-icon" (click)="viewChallenge(c.id)" title="View Details">
                          <span class="material-icons">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="expandedRowId() === c.id" class="detail-row">
                      <td colspan="10" style="padding: 0; background: #f8fafc">
                        <app-library-participants [challengeId]="c.id"></app-library-participants>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>

            <div class="pagination-controls">
              <div class="page-info">
                Showing {{ (currentPage() * pageSize) + 1 }} to {{ mathMin((currentPage() + 1) * pageSize, totalElements()) }} of {{ totalElements() }} challenges
              </div>
              <div class="page-buttons">
                <button class="btn btn-icon" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)"><span class="material-icons">chevron_left</span></button>
                <div class="page-numbers" style="display: flex; gap: 0.25rem">
                  <button class="btn btn-icon" style="background: #f1f5f9; color: #0f172a">{{ currentPage() + 1 }}</button>
                </div>
                <button class="btn btn-icon" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)"><span class="material-icons">chevron_right</span></button>
              </div>
              <div class="rows-per-page">
                <span style="font-size: 0.875rem; color: #64748b; margin-right: 0.5rem">Rows per page:</span>
                <select class="filter-dropdown" style="padding: 0.25rem 2rem 0.25rem 0.5rem; background-position: right 0.25rem center" disabled>
                  <option>10</option>
                </select>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .library-container {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      padding: 2rem 2.5rem;
      color: #0f172a;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header-left h1 { font-size: 1.875rem; font-weight: 700; margin: 0; color: #0f172a; letter-spacing: -0.02em; }
    .header-left p { margin: 0.5rem 0 0; color: #64748b; font-size: 0.95rem; }
    .header-right { display: flex; gap: 0.75rem; }

    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
      border-radius: 8px; cursor: pointer; border: none; transition: all 0.2s;
    }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-primary { background: #059669; color: white; }
    .btn-primary:hover { background: #047857; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 0.4rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 2rem;
    }
    .stat-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      border: 1px solid #e2e8f0; display: flex; flex-direction: column;
    }
    .stat-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .stat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .icon-total { background: #ecfdf5; color: #059669; }
    .icon-active { background: #eff6ff; color: #2563eb; }
    .icon-scheduled { background: #eff6ff; color: #3b82f6; }
    .icon-completed { background: #fff7ed; color: #ea580c; }
    .icon-archived { background: #f1f5f9; color: #475569; }

    .stat-title { color: #475569; font-size: 0.875rem; font-weight: 500; }
    .stat-value { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; line-height: 1; }
    .stat-trend { font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem; font-weight: 500; }
    .trend-up { color: #059669; }
    .trend-down { color: #dc2626; }

    .filter-bar {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem;
    }
    .search-input {
      display: flex; align-items: center; background: white; border: 1px solid #cbd5e1;
      border-radius: 8px; padding: 0.5rem 1rem; width: 320px;
    }
    .search-input input { border: none; outline: none; width: 100%; margin-left: 0.5rem; font-size: 0.9rem; color: #0f172a; }
    .search-input input::placeholder { color: #94a3b8; }
    .search-input .material-icons { color: #94a3b8; font-size: 1.25rem; }

    .filter-actions { display: flex; gap: 0.75rem; }
    .filter-dropdown {
      padding: 0.5rem 2.25rem 0.5rem 1rem; border: 1px solid #cbd5e1;
      border-radius: 8px; background-color: white; font-size: 0.875rem; color: #334155; font-weight: 500;
      outline: none; cursor: pointer; appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E');
      background-repeat: no-repeat; background-position: right 0.5rem center;
    }

    .tabs {
      display: flex; gap: 2rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem;
    }
    .tab {
      background: none; border: none; padding: 0.75rem 0; font-size: 0.9rem;
      font-weight: 500; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent;
      margin-bottom: -1px; transition: all 0.2s;
    }
    .tab:hover { color: #0f172a; }
    .tab.active { color: #059669; border-bottom-color: #059669; font-weight: 600; }

    .table-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 1rem 1.25rem; background: white; color: #64748b; font-weight: 500; font-size: 0.75rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.875rem; vertical-align: middle; }
    .data-table tbody tr:hover { background: #f8fafc; }

    .campaign-cell { display: flex; align-items: center; gap: 1rem; }
    .campaign-icon { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .campaign-info { display: flex; flex-direction: column; }
    .campaign-title { font-weight: 600; color: #0f172a; font-size: 0.9rem; margin-bottom: 0.125rem;}
    .campaign-desc { font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }

    .cat-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #0f172a; font-size: 0.85rem;}
    .cat-cell .material-icons { font-size: 1.25rem; color: #64748b; }

    .badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
    .badge-auto { background: #ecfdf5; color: #059669; }
    .badge-manual { background: #eff6ff; color: #2563eb; }

    .status-ACTIVE { background: #dcfce3; color: #166534; }
    .status-PENDING { background: #fef08a; color: #854d0e; }
    .status-COMPLETED { background: #f3e8ff; color: #7e22ce; }
    .status-ARCHIVED { background: #f1f5f9; color: #475569; }
    .status-UPCOMING { background: #e0f2fe; color: #0369a1; }
    .status-CLOSED { background: #fee2e2; color: #991b1b; }

    .progress-cell { display: flex; flex-direction: column; gap: 0.375rem; width: 100px; }
    .progress-text { font-size: 0.75rem; font-weight: 600; color: #0f172a; text-align: left; }
    .progress-bar-bg { width: 100%; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: #059669; border-radius: 999px; transition: width 0.3s ease; }

    .bulk-bar { display: flex; align-items: center; gap: 1.5rem; padding: 0.75rem 1.5rem; background: white; border: 1px solid #059669; border-radius: 8px; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); animation: slideDown 0.2s ease-out; }
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .bulk-selected { font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .bulk-btn { background: none; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #334155; cursor: pointer; padding: 0.4rem 1rem; border-radius: 6px; transition: background 0.2s; }
    .bulk-btn:hover { background: #f1f5f9; }
    .bulk-btn.delete { color: #dc2626; border-color: #fca5a5; }
    .bulk-btn.delete:hover { background: #fef2f2; }
    .bulk-close { margin-left: auto; border: none; }

    .custom-checkbox { width: 1.125rem; height: 1.125rem; border-radius: 4px; border: 1px solid #cbd5e1; appearance: none; cursor: pointer; background: white; position: relative; transition: all 0.2s; }
    .custom-checkbox:checked { background: #059669; border-color: #059669; }
    .custom-checkbox:checked::after { content: ''; position: absolute; left: 5px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

    .pagination-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    .page-info { color: #64748b; font-size: 0.875rem; }
    .page-buttons { display: flex; gap: 0.5rem; align-items: center; }
    .rows-per-page { display: flex; align-items: center; }
  `]
})
export class LibraryComponent implements OnInit {
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private dialog = inject(ConfirmationDialogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  challenges = signal<Challenge[]>([]);
  stats = signal<ChallengeStats | null>(null);
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);
  expandedRowId = signal<number | null>(null);
  
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  pageSize = 10;

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  trackingControl = new FormControl('');

  carbonCategories = signal<CarbonCategory[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  currentTab = signal<string>('');

  private triggerSubject = new BehaviorSubject<void>(undefined);

  ngOnInit() {
    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.carbonCategories.set(cats);
    });
    this.loadStats();
    this.setupFilters();
    this.setupReactiveStream();
  }

  private loadStats() {
    this.challengeService.getChallengeStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(s => this.stats.set(s));
  }

  private setupFilters() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.resetAndLoad());

    this.statusControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      this.currentTab.set(val || '');
      this.resetAndLoad();
    });
    this.trackingControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());
  }

  private setupReactiveStream() {
    this.triggerSubject.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.apiError.set(false);

        const search = this.searchControl.value || undefined;
        const status = this.statusControl.value || undefined;
        const tracking = this.trackingControl.value || undefined;

        return this.challengeService.getChallenges(this.currentPage(), this.pageSize, search, status, tracking)
          .pipe(
            catchError(err => {
              console.error('Failed to load challenges:', err);
              this.apiError.set(true);
              this.toast.error('Failed to load Challenges.');
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: PageableResponse<Challenge> | null) => {
      if (res) {
        this.challenges.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.clearSelection();
      }
    });
  }

  resetAndLoad() {
    this.currentPage.set(0);
    this.triggerSubject.next();
  }

  refresh() {
    this.toast.info('Refreshing library...');
    this.loadStats();
    this.triggerSubject.next();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.triggerSubject.next();
    }
  }

  setTab(tab: string) {
    this.statusControl.setValue(tab); // This will trigger resetAndLoad because of valueChanges subscription
  }

  toggleSelection(id: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const newSet = new Set(this.selectedIds());
    if (isChecked) newSet.add(id);
    else newSet.delete(id);
    this.selectedIds.set(newSet);
  }

  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      const allIds = this.challenges().map(c => c.id);
      this.selectedIds.set(new Set(allIds));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  isAllSelected(): boolean {
    return this.challenges().length > 0 && this.selectedIds().size === this.challenges().length;
  }

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  toastInfo(msg: string) {
    this.toast.info(msg);
  }

  createChallenge() {
    this.router.navigate(['/admin/challenges/wizard']);
  }

  viewChallenge(id: number) {
    this.expandedRowId.update(current => current === id ? null : id);
  }

  trackById(index: number, challenge: Challenge): number {
    return challenge.id;
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  getCarbonCategoryName(id: number | null | undefined): string {
    if (!id) return 'Unknown';
    const cat = this.carbonCategories().find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }

  getCategoryIcon(id: number | null | undefined): string {
    const name = this.getCarbonCategoryName(id).toLowerCase();
    if (name.includes('transport')) return 'directions_car';
    if (name.includes('waste')) return 'delete_outline';
    if (name.includes('water')) return 'water_drop';
    if (name.includes('energy') || name.includes('electric')) return 'bolt';
    if (name.includes('food') || name.includes('diet') || name.includes('meal')) return 'restaurant';
    if (name.includes('shopping')) return 'shopping_bag';
    return 'eco';
  }

  getGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
    ];
    return gradients[id % gradients.length];
  }

  getProgressPercent(c: Challenge): number {
    if (!c.targetValue) return 0;
    const progress = c.communityProgress || 0;
    const percent = Math.min((progress / c.targetValue) * 100, 100);
    return Math.round(percent);
  }

  getStatusClass(status: string): string {
    return 'status-' + (status || '').toUpperCase();
  }
}
