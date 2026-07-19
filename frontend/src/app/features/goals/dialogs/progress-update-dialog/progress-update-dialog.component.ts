import { Component, Inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Goal } from '../../interfaces/goal.interface';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-progress-update-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule, LucideAngularModule],
  template: `
    <div class="p-4" role="dialog" aria-modal="true" [attr.aria-labelledby]="'progressDialogTitle'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 id="progressDialogTitle" class="mb-0 fw-bold">Update Progress</h4>
        <button mat-dialog-close class="btn btn-icon text-muted" aria-label="Close dialog">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <p class="text-muted small mb-4">Record new progress for <strong>{{ data.goal.title }}</strong>.</p>

      <div class="mb-4 text-center" aria-live="polite">
        <h1 class="display-4 fw-bold text-primary mb-0">{{ newPercentage() }}%</h1>
        <p class="text-muted small">Target: {{ data.goal.targetValue }} {{ data.goal.measurementUnit }}</p>
      </div>
      
      <div class="progress mb-4" style="height: 12px; border-radius: 6px;" role="progressbar" [attr.aria-valuenow]="newPercentage()" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
             [style.width.%]="newPercentage()"></div>
      </div>

      <div class="mb-4">
        <label class="form-label text-muted small fw-semibold" for="valueInput">Add Value ({{ data.goal.measurementUnit }})</label>
        <div class="d-flex align-items-center gap-3">
          <input id="valueRange" type="range" class="form-range flex-grow-1" min="0" [max]="remainingValue" 
                 [ngModel]="addedValue()" (ngModelChange)="addedValue.set($event)" aria-label="Progress slider">
          <input id="valueInput" type="number" class="premium-input text-center" style="width: 100px; height: 40px;" 
                 [ngModel]="addedValue()" (ngModelChange)="addedValue.set($event)" min="0" aria-label="Progress value input">
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label text-muted small fw-semibold" for="notesInput">Progress Notes (Optional)</label>
        <textarea id="notesInput" class="premium-input" [(ngModel)]="note" rows="2" placeholder="What did you achieve?"></textarea>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-light" mat-dialog-close aria-label="Cancel">Cancel</button>
        <button type="button" class="premium-btn premium-btn-primary d-flex align-items-center gap-2" (click)="onSave()" [disabled]="isLoading || addedValue() <= 0" aria-label="Save Progress">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <lucide-icon *ngIf="!isLoading" name="save" [size]="18"></lucide-icon>
          {{ isLoading ? 'Saving...' : 'Save Progress' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .btn-icon {
      padding: 0;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
    }
    .btn-icon:hover, .btn-icon:focus {
      background-color: var(--color-border);
      border-radius: 50%;
      outline: none;
    }
  `]
})
export class ProgressUpdateDialogComponent {
  addedValue = signal<number>(0);
  note = '';
  isLoading = false;
  
  remainingValue: number;

  newPercentage = computed(() => {
    const total = this.data.goal.currentValue + this.addedValue();
    const pct = Math.round((total / this.data.goal.targetValue) * 100);
    return Math.min(pct, 100);
  });

  constructor(
    public dialogRef: MatDialogRef<ProgressUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { goal: Goal }
  ) {
    this.remainingValue = Math.max(0, data.goal.targetValue - data.goal.currentValue);
  }

  onSave() {
    if (this.addedValue() > 0) {
      this.isLoading = true;
      setTimeout(() => {
        this.dialogRef.close({ value: this.addedValue(), note: this.note });
      }, 500);
    }
  }
}
