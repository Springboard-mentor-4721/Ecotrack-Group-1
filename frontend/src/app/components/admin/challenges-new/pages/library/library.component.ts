import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef, computed  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of } from 'rxjs';
import { AdminChallengeService, BulkActionResult } from '../../services/admin-challenge.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogService } from '../../../../../shared/services/confirmation-dialog.service';
import { Challenge, ChallengeStats } from '../../../../../models/challenge.models';
import { PageableResponse } from '../../../../../models/carbon.models';

import { CarbonCategory } from '../../../../../models/carbon-category.models';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../../../shared/ui/loading-skeleton/loading-skeleton.component';
import { LibraryParticipantsComponent } from './components/library-participants.component';
import { BulkActionBarComponent } from '../../components/bulk-action-bar/bulk-action-bar.component';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-admin-challenges-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, EmptyStateComponent, LoadingSkeletonComponent, LibraryParticipantsComponent, BulkActionBarComponent],
  template: `
    <div class="library-container">
      <header class="header">
        <div class="header-left">
          <h1>Challenge Library</h1>
          <p>Manage, monitor and organize all sustainability challenges.</p>
        </div>
        <div class="header-right">

        <button class="btn btn-primary" (click)="createChallenge()">
          <span class="material-icons">add</span> Create Challenge
        </button>
        </div>
      </header>

      <div class="stats-grid" *ngIf="stats() as s">
        <div class="stat-card">
          <div class="stat-icon" style="color: #22c55e; background: #dcfce7;"><span class="material-icons">description</span></div>
          <div class="stat-label">Total Challenges</div>
          <div class="stat-value">{{ s.totalChallenges || 0 }}</div>
          <div class="stat-trend" *ngIf="s.totalChallengesTrend != null"><span [ngClass]="s.totalChallengesTrend >= 0 ? 'positive' : 'negative'"><span class="material-icons">{{ s.totalChallengesTrend >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span> {{ s.totalChallengesTrend }}%</span> vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #10b981; background: #d1fae5;"><span class="material-icons">play_circle_outline</span></div>
          <div class="stat-label">Active Challenges</div>
          <div class="stat-value">{{ s.activeCount || 0 }}</div>
          <div class="stat-trend" *ngIf="s.activeCountTrend != null"><span [ngClass]="s.activeCountTrend >= 0 ? 'positive' : 'negative'"><span class="material-icons">{{ s.activeCountTrend >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span> {{ s.activeCountTrend }}%</span> vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #3b82f6; background: #dbeafe;"><span class="material-icons">calendar_today</span></div>
          <div class="stat-label">Scheduled Challenges</div>
          <div class="stat-value">{{ s.scheduledCount || 0 }}</div>
          <div class="stat-trend" *ngIf="s.scheduledCountTrend != null"><span [ngClass]="s.scheduledCountTrend >= 0 ? 'positive' : 'negative'"><span class="material-icons">{{ s.scheduledCountTrend >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span> {{ s.scheduledCountTrend }}%</span> vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #f97316; background: #ffedd5;"><span class="material-icons">description</span></div>
          <div class="stat-label">Draft Challenges</div>
          <div class="stat-value">{{ s.draftCount || 0 }}</div>
          <div class="stat-trend" *ngIf="s.draftCountTrend != null"><span [ngClass]="s.draftCountTrend >= 0 ? 'positive' : 'negative'"><span class="material-icons">{{ s.draftCountTrend >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span> {{ s.draftCountTrend }}%</span> vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #64748b; background: #f1f5f9;"><span class="material-icons">inventory_2</span></div>
          <div class="stat-label">Archived Challenges</div>
          <div class="stat-value">{{ s.archivedCount || 0 }}</div>
          <!-- Archived has no trend in design -->
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <div class="search-input">
            <span class="material-icons">search</span>
            <input type="text" [formControl]="searchControl" placeholder="Search challenges..." />
          </div>

          <!-- Category Dropdown -->
          <div class="action-dropdown-container" style="min-width: 170px;">
            <div class="filter-dropdown" (click)="showCategoryDropdown = !showCategoryDropdown; $event.stopPropagation()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: white;">
              <span>{{ getCategoryLabel() }}</span>
              <span class="material-icons" style="font-size: 1.1rem; color: #94a3b8;">expand_more</span>
            </div>
            <div *ngIf="showCategoryDropdown" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 40;" (click)="showCategoryDropdown = false; $event.stopPropagation()"></div>
            <div *ngIf="showCategoryDropdown" class="action-dropdown" style="left: 0; right: auto; top: calc(100% + 4px); max-height: 250px; overflow-y: auto;">
              <button class="dropdown-item" [class.active-item]="categoryControl.value === ''" (click)="categoryControl.setValue(''); showCategoryDropdown = false">Category (All)</button>
              <button class="dropdown-item" *ngFor="let cat of carbonCategories()" [class.active-item]="categoryControl.value === cat.id.toString()" (click)="categoryControl.setValue(cat.id.toString()); showCategoryDropdown = false">{{ cat.name }}</button>
            </div>
          </div>

          <!-- Tracking Method Dropdown -->
          <div class="action-dropdown-container" style="min-width: 170px;">
            <div class="filter-dropdown" (click)="showTrackingDropdown = !showTrackingDropdown; $event.stopPropagation()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: white;">
              <span>{{ trackingControl.value === '' ? 'Tracking Method' : (trackingControl.value === 'AUTOMATIC' ? 'Automatic' : 'Manual') }}</span>
              <span class="material-icons" style="font-size: 1.1rem; color: #94a3b8;">expand_more</span>
            </div>
            <div *ngIf="showTrackingDropdown" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 40;" (click)="showTrackingDropdown = false; $event.stopPropagation()"></div>
            <div *ngIf="showTrackingDropdown" class="action-dropdown" style="left: 0; right: auto; top: calc(100% + 4px); max-height: 250px; overflow-y: auto;">
              <button class="dropdown-item" [class.active-item]="trackingControl.value === ''" (click)="trackingControl.setValue(''); showTrackingDropdown = false">Tracking Method (All)</button>
              <button class="dropdown-item" [class.active-item]="trackingControl.value === 'AUTOMATIC'" (click)="trackingControl.setValue('AUTOMATIC'); showTrackingDropdown = false">Automatic</button>
              <button class="dropdown-item" [class.active-item]="trackingControl.value === 'MANUAL'" (click)="trackingControl.setValue('MANUAL'); showTrackingDropdown = false">Manual</button>
            </div>
          </div>

          <!-- Type Dropdown -->
          <div class="action-dropdown-container" style="min-width: 170px;">
            <div class="filter-dropdown" (click)="showTypeDropdown = !showTypeDropdown; $event.stopPropagation()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: white;">
              <span>{{ typeControl.value === '' ? 'Type' : (typeControl.value === 'ACHIEVEMENT' ? 'Achievement' : 'Budget') }}</span>
              <span class="material-icons" style="font-size: 1.1rem; color: #94a3b8;">expand_more</span>
            </div>
            <div *ngIf="showTypeDropdown" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 40;" (click)="showTypeDropdown = false; $event.stopPropagation()"></div>
            <div *ngIf="showTypeDropdown" class="action-dropdown" style="left: 0; right: auto; top: calc(100% + 4px); max-height: 250px; overflow-y: auto;">
              <button class="dropdown-item" [class.active-item]="typeControl.value === ''" (click)="typeControl.setValue(''); showTypeDropdown = false">Type (All)</button>
              <button class="dropdown-item" [class.active-item]="typeControl.value === 'ACHIEVEMENT'" (click)="typeControl.setValue('ACHIEVEMENT'); showTypeDropdown = false">Achievement</button>
              <button class="dropdown-item" [class.active-item]="typeControl.value === 'BUDGET'" (click)="typeControl.setValue('BUDGET'); showTypeDropdown = false">Budget</button>
            </div>
          </div>

          <!-- Sort Dropdown -->
          <div class="action-dropdown-container" style="min-width: 150px;">
            <div class="filter-dropdown" (click)="showSortDropdown = !showSortDropdown; $event.stopPropagation()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: white;">
              <span>{{ getSortLabel() }}</span>
              <span class="material-icons" style="font-size: 1.1rem; color: #94a3b8;">expand_more</span>
            </div>
            <div *ngIf="showSortDropdown" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 40;" (click)="showSortDropdown = false; $event.stopPropagation()"></div>
            <div *ngIf="showSortDropdown" class="action-dropdown" style="left: 0; right: auto; top: calc(100% + 4px); max-height: 250px; overflow-y: auto;">
              <button class="dropdown-item" [class.active-item]="sortControl.value === 'newest'" (click)="sortControl.setValue('newest'); showSortDropdown = false">Sort: Newest</button>
              <button class="dropdown-item" [class.active-item]="sortControl.value === 'oldest'" (click)="sortControl.setValue('oldest'); showSortDropdown = false">Sort: Oldest</button>
              <button class="dropdown-item" [class.active-item]="sortControl.value === 'a-z'" (click)="sortControl.setValue('a-z'); showSortDropdown = false">Sort: A-Z</button>
              <button class="dropdown-item" [class.active-item]="sortControl.value === 'z-a'" (click)="sortControl.setValue('z-a'); showSortDropdown = false">Sort: Z-A</button>
            </div>
          </div>

          <button class="btn btn-outline" style="border-color: #cbd5e1; color: #64748b;" (click)="clearFilters()">
            <span class="material-icons" style="font-size: 1.1rem;">filter_alt_off</span> Clear Filters
          </button>
        </div>

      </div>

      <div class="tabs" style="align-items: center; padding-bottom: 4px;">
        <button class="btn btn-outline" style="padding: 0.25rem 0.75rem; border-color: #cbd5e1; background: transparent; color: #64748b;" (click)="toggleSelectionMode()">
          <span class="material-icons" style="font-size: 1.1rem;">check_box</span> Select
        </button>
        <button class="tab" [class.active]="currentTab() === ''" (click)="setTab('')">All ({{ stats()?.totalChallenges || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'PENDING'" (click)="setTab('PENDING')">Draft ({{ stats()?.draftCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'UPCOMING'" (click)="setTab('UPCOMING')">Scheduled ({{ stats()?.scheduledCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'ACTIVE'" (click)="setTab('ACTIVE')">Active ({{ stats()?.activeCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'COMPLETED'" (click)="setTab('COMPLETED')">Completed ({{ stats()?.completedCount || 0 }})</button>
        <button class="tab" [class.active]="currentTab() === 'ARCHIVED'" (click)="setTab('ARCHIVED')">Archived ({{ stats()?.archivedCount || 0 }})</button>
      </div>

      <div class="error-banner" *ngIf="apiError()" style="display: flex; gap: 1rem; align-items: center; background: #fef2f2; padding: 1rem; color: #dc2626; border-radius: 8px; margin-bottom: 2rem;">
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
                    <th style="width: 40px; padding-right: 0" *ngIf="selectionMode()">
                      <input type="checkbox" class="custom-checkbox"
                        [checked]="isAllSelected()"
                        (change)="toggleAll($event)" />
                    </th>
                    <th style="text-align: center;">Challenge</th>
                    <th>Category</th>
                    <th>Tracking Method</th>
                    <th>Type</th>
                    <th>Participants</th>
                    <th>XP Reward</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>

                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <ng-container *ngFor="let c of challenges(); trackBy: trackById">
                    <tr [class.archived]="c.status === 'ARCHIVED'" [class.expanded]="expandedRowId() === c.id" (click)="viewChallenge(c.id)" (dblclick)="onRowDoubleClick(c.id, $event)">
                      <td style="padding-right: 0" *ngIf="selectionMode()">
                        <input type="checkbox" class="custom-checkbox"
                          [checked]="selectedIds().has(c.id)"
                          (click)="$event.stopPropagation()"
                          (change)="toggleSelection(c.id)" />
                      </td>
                      <td>
                        <div class="campaign-cell" style="justify-content: center; text-align: left;">
                          <div class="campaign-icon" [ngStyle]="{'background': $any(c).imageUrl ? 'url(' + resolveImageUrl($any(c).imageUrl) + ') center/cover no-repeat' : getGradient(c.id)}">
                            <span class="material-icons" style="color: white" *ngIf="!$any(c).imageUrl">flag</span>
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
                        <div class="cat-cell text-muted" *ngIf="c.trackingMethod !== 'AUTOMATIC'">
                          <span>N/A</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="c.trackingMethod === 'AUTOMATIC' ? 'badge-auto' : 'badge-manual'">
                          {{ c.trackingMethod | titlecase }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="c.challengeEvaluationType === 'BUDGET' ? 'badge-budget' : 'badge-achievement'">
                          {{ (c.challengeEvaluationType || 'ACHIEVEMENT') | titlecase }}
                        </span>
                      </td>
                      <td style="font-weight: 500; color: #0f172a">{{ c.participantCount || 0 | number }}</td>
                      <td style="font-weight: 500; color: #0f172a">{{ c.rewardXp }} XP</td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(c.status)">
                          {{ c.status === 'PENDING' ? 'Draft' : (c.status | titlecase) }}
                        </span>
                      </td>
                      <td style="color: #0f172a; font-weight: 500; font-size: 0.85rem; white-space: nowrap;">
                        {{ c.startDate | date:'dd MMM yyyy' }}
                      </td>
                      <td style="color: #64748b; font-size: 0.85rem; white-space: nowrap;">
                        {{ c.endDate | date:'dd MMM yyyy' }}
                      </td>

                      <td class="actions-cell">
                        <div class="action-dropdown-container">
                          <button class="btn-icon" title="Actions" (click)="toggleActionMenu(c.id, $event)">
                            <span class="material-icons">more_vert</span>
                          </button>
                          <div class="action-dropdown" *ngIf="activeActionMenuId() === c.id">
                            <button class="dropdown-item" (click)="$event.stopPropagation(); viewChallenge(c.id)">
                              <span class="material-icons">visibility</span> View Details
                            </button>
                            <button class="dropdown-item" *ngIf="c.status === 'PENDING' || c.status === 'UPCOMING'" (click)="$event.stopPropagation(); editChallenge(c.id)">
                              <span class="material-icons" style="color: #3b82f6">edit</span> Edit
                            </button>
                            <button class="dropdown-item" *ngIf="c.status === 'PENDING'" (click)="$event.stopPropagation(); approveChallenge(c)">
                              <span class="material-icons" style="color: #059669">check_circle</span> Approve
                            </button>
                            <button class="dropdown-item" *ngIf="c.status === 'PENDING'" (click)="$event.stopPropagation(); rejectChallenge(c)">
                              <span class="material-icons" style="color: #dc2626">cancel</span> Reject
                            </button>
                            <button class="dropdown-item" *ngIf="c.status !== 'ARCHIVED'" (click)="$event.stopPropagation(); archiveChallenge(c)">
                              <span class="material-icons" style="color: #64748b">archive</span> Archive
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="expandedRowId() === c.id" class="detail-row">
                      <td colspan="11" style="padding: 0; background: #f8fafc">
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
                <div class="action-dropdown-container">
                  <div class="filter-dropdown" (click)="showPageSizeDropdown = !showPageSizeDropdown; $event.stopPropagation()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: white; padding: 0.25rem 0.5rem 0.25rem 0.75rem; min-width: 60px; border-radius: 8px; border: 1px solid #e2e8f0; height: 32px;">
                    <span>{{ pageSizeControl.value }}</span>
                    <span class="material-icons" style="font-size: 1.1rem; color: #94a3b8; margin-left: 0.25rem;">expand_more</span>
                  </div>
                  <div *ngIf="showPageSizeDropdown" class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 40;" (click)="showPageSizeDropdown = false; $event.stopPropagation()"></div>
                  <div *ngIf="showPageSizeDropdown" class="action-dropdown" style="bottom: calc(100% + 4px); top: auto; right: 0; left: auto; max-height: 250px; overflow-y: auto; min-width: 80px;">
                    <button class="dropdown-item" [class.active-item]="pageSizeControl.value === 5" (click)="pageSizeControl.setValue(5); showPageSizeDropdown = false">5</button>
                    <button class="dropdown-item" [class.active-item]="pageSizeControl.value === 10" (click)="pageSizeControl.setValue(10); showPageSizeDropdown = false">10</button>
                    <button class="dropdown-item" [class.active-item]="pageSizeControl.value === 25" (click)="pageSizeControl.setValue(25); showPageSizeDropdown = false">25</button>
                    <button class="dropdown-item" [class.active-item]="pageSizeControl.value === 50" (click)="pageSizeControl.setValue(50); showPageSizeDropdown = false">50</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <app-bulk-action-bar
          *ngIf="selectedIds().size > 0"
          [selectedCount]="selectedIds().size"
          [showApprove]="showBulkApprove()"
          (action)="handleBulkAction($event)"
          (clearSelection)="clearSelection()">
        </app-bulk-action-bar>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .library-container {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      padding: 1.5rem 1rem;
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
      border-radius: 8px; cursor: pointer; border: none; transition: all 0.2s ease;
    }
    .btn:active { transform: translateY(1px); }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-primary { background: #059669; color: white; }
    .btn-primary:hover { background: #047857; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 0.4rem; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
    .btn-icon:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Stats Grid */
    .stats-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; margin-bottom: 2rem;
    }
    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card {
      background: white; border-radius: 12px; padding: 1.5rem 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
      border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; gap: 0.5rem;
      align-items: center; text-align: center;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
    }
    .stat-icon {
      width: 40px; height: 40px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 0.5rem;
    }
    .stat-icon .material-icons { font-size: 1.5rem; }
    .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .stat-trend { font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.25rem; color: #94a3b8; }
    .stat-trend .positive { color: #16a34a; display: flex; align-items: center; }
    .stat-trend .negative { color: #ef4444; display: flex; align-items: center; }
    .stat-trend .material-icons { font-size: 0.875rem; }

    .filter-bar {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .filter-group { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; flex: 1; }
    .filter-right { display: flex; }
    .search-input {
      position: relative; display: flex; align-items: center; width: 280px;
    }
    .search-input input {
      width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; border: 1px solid #cbd5e1;
      border-radius: 8px; font-size: 0.875rem; color: #334155;
    }
    .search-input input:focus { outline: none; border-color: #059669; }
    .search-input .material-icons { position: absolute; left: 0.75rem; color: #94a3b8; font-size: 1.25rem; }
    .filter-btn { display: flex; align-items: center; gap: 0.25rem; font-weight: 500; color: #0f172a; }
    .badge-count { background: #059669; color: white; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; margin-left: 0.25rem; }
    .date-range-btn { display: flex; align-items: center; gap: 0.5rem; color: #334155; font-weight: 500; font-size: 0.875rem; border-color: #cbd5e1; }
    .date-range-btn .material-icons { font-size: 1.1rem; color: #64748b; }
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

    .table-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); }
    .table-responsive { }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 0.5rem 0.25rem; background: white; color: #64748b; font-weight: 500; font-size: 0.75rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; text-align: center; }
    .data-table th:first-child { border-top-left-radius: 12px; }
    .data-table th:last-child { border-top-right-radius: 12px; }
    .data-table td { padding: 0.5rem 0.25rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.8rem; vertical-align: middle; text-align: center; }
    .data-table tbody tr { cursor: pointer; }
    .data-table tbody tr:hover { background: #f8fafc; }

    .campaign-cell { display: flex; align-items: center; gap: 0.75rem; }
    .campaign-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .campaign-info { display: flex; flex-direction: column; max-width: 170px; }
    .campaign-title { font-weight: 600; color: #0f172a; font-size: 0.9rem; margin-bottom: 0.125rem;}
    .campaign-desc { font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }

    .cat-cell { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 500; color: #0f172a; font-size: 0.85rem;}
    .cat-cell .material-icons { font-size: 1.25rem; color: #64748b; }

    .badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
    .badge-auto { background: #ecfdf5; color: #059669; }
    .badge-manual { background: #eff6ff; color: #2563eb; }
    .badge-achievement { background: #e0e7ff; color: #4338ca; }
    .badge-budget { background: #fef08a; color: #a16207; }

    .status-ACTIVE { background: #dcfce3; color: #166534; }
    .status-PENDING { background: #fef08a; color: #854d0e; }
    .status-COMPLETED { background: #f3e8ff; color: #7e22ce; }
    .status-ARCHIVED { background: #f1f5f9; color: #475569; }
    .status-UPCOMING { background: #e0f2fe; color: #0369a1; }
    .status-CLOSED { background: #fee2e2; color: #991b1b; }

    .progress-cell { display: flex; flex-direction: column; gap: 0.375rem; width: 100px; margin: 0 auto; align-items: center; }
    .progress-text { font-size: 0.75rem; font-weight: 600; color: #0f172a; text-align: center; width: 100%; }
    .progress-bar-bg { width: 100%; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: #059669; border-radius: 999px; transition: width 0.3s ease; }

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
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    .page-info { color: #64748b; font-size: 0.875rem; }
    .page-buttons { display: flex; gap: 0.5rem; align-items: center; }
    .rows-per-page { display: flex; align-items: center; }

    .action-dropdown-container { position: relative; }
    .action-dropdown {
      position: absolute; right: 0; top: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); padding: 0.5rem 0;
      min-width: 160px; z-index: 50; animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .dropdown-item {
      display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.5rem 1rem; border: none;
      background: none; text-align: left; font-size: 0.875rem; color: #334155; cursor: pointer;
    }
    .dropdown-item:hover:not([disabled]) {
      background: #f1f5f9;
    }
    .dropdown-item.active-item { background: #e2e8f0 !important; font-weight: 600; color: #0f172a; }
    .dropdown-item[disabled] {
      color: #94a3b8;
      cursor: not-allowed;
      background: transparent;
    }
    .dropdown-item .material-icons { font-size: 1.25rem; color: #64748b; }

    /* Make table scrollable if it still exceeds screen width */
    .table-responsive { width: 100%; overflow: visible !important; }
  `]
})
export class LibraryComponent implements OnInit {
  private challengeService = inject(AdminChallengeService);
  private toast = inject(ToastService);
  private dialog = inject(ConfirmationDialogService);
  private router = inject(Router);

  // Custom Dropdown states
  showTrackingDropdown = false;
  showCategoryDropdown = false;
  showStatusDropdown = false;
  showTypeDropdown = false;
  showSortDropdown = false;
  showPageSizeDropdown = false;

  private destroyRef = inject(DestroyRef);


  challenges = signal<Challenge[]>([]);
  stats = signal<ChallengeStats | null>(null);
  loading = signal<boolean>(true);
  apiError = signal<boolean>(false);
  expandedRowId = signal<number | null>(null);
  activeActionMenuId = signal<number | null>(null);
  selectionMode = signal<boolean>(false);

  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  pageSize = 10;

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  pageSizeControl = new FormControl(10);
  trackingControl = new FormControl('');
  categoryControl = new FormControl('');
  typeControl = new FormControl('');
  sortControl = new FormControl('newest');

  carbonCategories = signal<CarbonCategory[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  currentTab = signal<string>('');

  isAllSelected = computed(() => {
    const ids = this.selectedIds();
    const ch = this.challenges();
    return ch.length > 0 && ch.every(c => ids.has(c.id));
  });

  showBulkApprove = computed(() => {
    const ids = this.selectedIds();
    const ch = this.challenges();
    return ids.size > 0 && Array.from(ids).every(id => ch.find(c => c.id === id)?.status === 'PENDING');
  });

  private triggerSubject = new BehaviorSubject<void>(undefined);

  ngOnInit() {
    this.challengeService.getCarbonCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cats => {
      this.carbonCategories.set(cats);
    });
    this.loadStats();
    this.setupFilters();
    this.setupReactiveStream();

    document.addEventListener('click', this.onClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onClickOutside.bind(this));
  }

  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-dropdown-container')) {
      this.activeActionMenuId.set(null);
    }
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
    this.categoryControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());
    this.typeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());
    this.sortControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.resetAndLoad());
    this.pageSizeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(size => {
      if (size) {
        this.pageSize = size;
        this.resetAndLoad();
      }
    });
  }

  private setupReactiveStream() {
    this.triggerSubject.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.apiError.set(false);

        const search = this.searchControl.value || undefined;
        const status = this.statusControl.value || undefined;
        const tracking = this.trackingControl.value || undefined;
        const categoryId = this.categoryControl.value || undefined;
        const evaluationType = this.typeControl.value || undefined;
        const sortOption = this.sortControl.value || undefined;

        let sort = undefined;
        if (sortOption === 'newest') sort = 'startDate,desc';
        else if (sortOption === 'oldest') sort = 'startDate,asc';
        else if (sortOption === 'a-z') sort = 'title,asc';
        else if (sortOption === 'z-a') sort = 'title,desc';

        return this.challengeService.getChallenges(this.currentPage(), this.pageSize, search, status, tracking, categoryId, evaluationType, sort)
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

  clearFilters() {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue('', { emitEvent: false });
    this.trackingControl.setValue('', { emitEvent: false });
    this.typeControl.setValue('', { emitEvent: false });
    this.sortControl.setValue('newest', { emitEvent: false });
    this.statusControl.setValue('', { emitEvent: false });
    this.resetAndLoad();
  }

  loadChallenges() {
    this.triggerSubject.next();
  }

  refresh() {
    this.toast.info('Refreshing library...');
    this.loadStats();
    this.loadChallenges();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.triggerSubject.next();
    }
  }



  getCategoryLabel(): string {
    const val = this.categoryControl.value;
    if (!val) return 'Category';
    const numVal = Number(val);
    const cat = this.carbonCategories().find(c => c.id === numVal);
    return cat ? cat.name : 'Category';
  }

  getStatusLabel(): string {
    const val = this.statusControl.value;
    switch(val) {
      case 'PENDING': return 'Draft';
      case 'UPCOMING': return 'Scheduled';
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Completed';
      case 'ARCHIVED': return 'Archived';
      default: return 'Status';
    }
  }

  getSortLabel(): string {
    const val = this.sortControl.value;
    switch(val) {
      case 'newest': return 'Sort: Newest';
      case 'oldest': return 'Sort: Oldest';
      case 'a-z': return 'Sort: A-Z';
      case 'z-a': return 'Sort: Z-A';
      default: return 'Sort: Newest';
    }
  }

  setTab(tab: string) {
    this.statusControl.setValue(tab);
  }

  toggleSelection(id: number) {
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedIds.set(new Set(this.challenges().map(c => c.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  clearSelection() {
    this.selectedIds.set(new Set());
    this.selectionMode.set(false);
  }

  toggleSelectionMode() {
    if (this.selectionMode()) {
      this.clearSelection();
    } else {
      this.selectionMode.set(true);
    }
  }

  onRowDoubleClick(id: number, event: Event) {
    event.stopPropagation();
    this.selectionMode.set(true);
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      newSet.add(id);
      return newSet;
    });
  }

  handleBulkAction(action: string) {
    const ids = Array.from(this.selectedIds());
    if (action === 'APPROVE') {
      this.dialog.confirm(`Approve ${ids.length} challenges?`).then(confirmed => {
        if (confirmed) this.executeBulkModerate('APPROVE', ids);
      });
    } else if (action === 'ARCHIVE') {
      this.dialog.confirm(`Archive ${ids.length} challenges?`).then(confirmed => {
        if (confirmed) this.executeBulkArchive(ids);
      });
    }
  }

  private executeBulkModerate(action: 'APPROVE' | 'REJECT', ids: number[]) {
    this.challengeService.bulkModerate({ ids, action }).subscribe({
      next: (res: BulkActionResult) => {
        if (res.failed.length === 0) {
          this.toast.success(`${res.succeeded.length} challenges updated successfully.`);
        } else {
        this.toast.info(`${res.succeeded.length} succeeded, ${res.failed.length} failed.`);
      }
      this.clearSelection();
      this.refresh();

    },
    error: () => {
      this.toast.error('Bulk action failed.');

    }
    });
  }

  private executeBulkArchive(ids: number[]) {
    this.challengeService.bulkArchive({ ids }).subscribe({
      next: (res: BulkActionResult) => {
        if (res.failed.length === 0) {
          this.toast.success(`${res.succeeded.length} challenges archived successfully.`);
        } else {
        this.toast.info(`${res.succeeded.length} succeeded, ${res.failed.length} failed.`);
      }
      this.clearSelection();
      this.refresh();

    },
    error: () => {
      this.toast.error('Bulk archive failed.');

    }
    });
  }

  toastInfo(msg: string) {
    this.toast.info(msg);
  }

  createChallenge() {
    this.router.navigate(['/admin/challenges/create']);
  }

  toggleActionMenu(id: number, event: Event) {
    event.stopPropagation();
    this.activeActionMenuId.update(current => current === id ? null : id);
  }

  toggleParticipants(id: number) {
    this.activeActionMenuId.set(null);
    this.expandedRowId.update(current => current === id ? null : id);
  }

  viewChallenge(id: number) {
    this.activeActionMenuId.set(null);
    this.router.navigate(['/admin/challenges', id]);
  }

  editChallenge(id: number) {
    this.activeActionMenuId.set(null);
    this.router.navigate(['/admin/challenges', id, 'edit']);
  }

  duplicateChallenge(id: number) {
    this.activeActionMenuId.set(null);
    this.toast.info('Preparing duplicate...');
    this.challengeService.getChallengeDetail(id).subscribe({
      next: (challenge) => {
        const duplicateData = this.challengeService.buildDuplicatePayload(challenge);
        this.router.navigate(['/admin/challenges/create/wizard'], {
          state: { duplicateData, originalName: challenge.title }
        });
      },
      error: () => this.toast.error('Failed to prepare duplicate.')
    });
  }

  viewAnalytics(id: number) {
    this.activeActionMenuId.set(null);
    this.router.navigate(['/admin/challenges/analytics'], { queryParams: { challengeId: id } });
  }

  approveChallenge(c: Challenge) {
    this.activeActionMenuId.set(null);
    this.dialog.confirm(`Are you sure you want to approve "${c.title}"?`).then(res => {
      if (res) {
        this.challengeService.moderateChallenge(c.id, 'APPROVE').subscribe({
          next: () => {
            this.toast.success(`Challenge "${c.title}" approved.`);
            this.refresh();

          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to approve challenge.';
            this.toast.error(msg);

          }
        });
      }
    });
  }

  rejectChallenge(c: Challenge) {
    this.activeActionMenuId.set(null);
    this.dialog.confirm(`Are you sure you want to reject "${c.title}"?`).then(res => {
      if (res) {
        this.challengeService.moderateChallenge(c.id, 'REJECT').subscribe({
          next: () => {
            this.toast.success(`Challenge "${c.title}" rejected.`);
            this.refresh();

          },
          error: (err) => {
            const msg = err.error?.message || 'Failed to reject challenge.';
            this.toast.error(msg);

          }
        });
      }
    });
  }

  archiveChallenge(c: Challenge) {
    this.activeActionMenuId.set(null);
    this.dialog.confirm(`Are you sure you want to archive "${c.title}"?`).then(res => {
      if (res) {
        this.challengeService.archiveChallenge(c.id).subscribe({
          next: () => {
            this.toast.success(`Challenge "${c.title}" archived.`);
            this.refresh();

          },
          error: () => {
            this.toast.error('Failed to archive challenge.');

          }
        });
      }
    });
  }

  trackById(index: number, challenge: Challenge): number {
    return challenge.id;
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  getCarbonCategoryName(id: number | null | undefined): string {
    if (!id) return 'General';
    const cat = this.carbonCategories().find(c => c.id === id);
    return cat ? cat.name : 'General';
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
    const progress = c.globalProgress || 0;
    const percent = Math.min((progress / c.targetValue) * 100, 100);
    return Math.round(percent);
  }

  getStatusClass(status: string): string {
    return 'status-' + (status || '').toUpperCase();
  }

  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return encodeURI(url);
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    if (url.startsWith('uploads/')) {
      return encodeURI(`${baseUrl}/${url}`);
    }
    return encodeURI(`${baseUrl}/uploads/${url}`);
  }
}
