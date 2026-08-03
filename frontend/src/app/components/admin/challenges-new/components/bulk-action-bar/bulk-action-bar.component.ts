import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` 
    <div class="bulk-action-bar" *ngIf="selectedCount > 0">
      <div class="selection-info">
        <span class="count">{{ selectedCount }} challenges selected</span>
        <button class="btn-clear" (click)="clearSelection.emit()">Clear selection</button>
      </div>
      <div class="actions">
        <button *ngIf="showApprove" class="btn-bulk btn-approve" (click)="action.emit('APPROVE')">
          <span class="material-icons">check_circle</span> Approve All
        </button>
        <button class="btn-bulk btn-archive" (click)="action.emit('ARCHIVE')">
          <span class="material-icons">archive</span> Archive All
        </button>
      </div>
    </div>
  `,
  styles: [` 
    .bulk-action-bar {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      z-index: 50;
      border: 1px solid #e2e8f0;
    }
    .selection-info { display: flex; align-items: center; gap: 1rem; }
    .count { font-weight: 600; color: #0f172a; }
    .btn-clear { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
    .btn-clear:hover { text-decoration: underline; }
    .actions { display: flex; gap: 0.75rem; }
    .btn-bulk { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; }
    .btn-approve { background: #ecfdf5; color: #059669; }
    .btn-approve:hover { background: #d1fae5; }
    .btn-archive { background: #f8fafc; color: #64748b; border-color: #cbd5e1; }
    .btn-archive:hover { background: #f1f5f9; }
    .material-icons { font-size: 1.25rem; }
  `]
})
export class BulkActionBarComponent {
  @Input() selectedCount = 0;
  @Input() showApprove = false;
  @Output() action = new EventEmitter<string>();
  @Output() clearSelection = new EventEmitter<void>();
}
