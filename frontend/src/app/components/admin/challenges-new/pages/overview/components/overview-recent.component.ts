import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../../../models/challenge.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview-recent',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../../shared/badges.css'],
  template: `
    <div class="recent-section">
      <div class="header-row">
        <h2>Recent Challenges</h2>
        <a routerLink="../library" class="view-all">View Full Library &rarr;</a>
      </div>

      <div class="table-container">
        <table class="challenges-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Participants</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td colspan="7" class="loading-state">
                <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
              </td>
            </tr>
            <tr *ngIf="!loading && (!challenges || challenges.length === 0)">
              <td colspan="7" class="empty-state">
                <p>No challenges found. Create one to get started.</p>
              </td>
            </tr>
            <tr *ngFor="let challenge of challenges" [class.archived]="challenge.status === 'ARCHIVED'">
              <td class="title-cell">
                <strong>{{ challenge.title }}</strong>
                <span class="type-badge">{{ challenge.typeCode }}</span>
              </td>
              <td><span class="status-badge" [ngClass]="challenge.status.toLowerCase()">{{ challenge.status }}</span></td>
              <td>{{ challenge.trackingMethod }}</td>
              <td>{{ challenge.communityProgress || 0 }}</td>
              <td>{{ challenge.startDate | date:'shortDate' }}</td>
              <td>{{ challenge.endDate | date:'shortDate' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" (click)="onView.emit(challenge.id)" title="View Details">
                  <span class="material-icons">visibility</span>
                </button>
                <button class="btn-icon" (click)="onEdit.emit(challenge.id)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .recent-section {
      background: var(--surface-card, #ffffff);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary, #0f172a);
    }
    .view-all {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    .view-all:hover {
      text-decoration: underline;
    }
    
    .table-container {
      overflow-x: auto;
    }
    .challenges-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .challenges-table th {
      padding: 1rem;
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      font-size: 0.875rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .challenges-table td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      font-size: 0.9375rem;
    }
    .challenges-table tbody tr:hover {
      background: #f8fafc;
    }
    .challenges-table tbody tr.archived {
      opacity: 0.6;
    }
    
    .title-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .type-badge {
      font-size: 0.75rem;
      color: #64748b;
    }
    
    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .btn-icon:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    
    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #64748b;
    }
    .skeleton-row {
      height: 20px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class OverviewRecentComponent {
  @Input() challenges: Challenge[] = [];
  @Input() loading = false;
  
  @Output() onView = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<number>();
}
