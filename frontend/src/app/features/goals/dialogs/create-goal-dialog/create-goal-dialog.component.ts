import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Goal, GoalCategory, GoalPriority } from '../../interfaces/goal.interface';
import { LucideAngularModule } from 'lucide-angular';

export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison
  return selectedDate >= today ? null : { pastDate: true };
}

@Component({
  selector: 'app-create-goal-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, LucideAngularModule],
  template: `
    <div class="p-4" role="dialog" aria-modal="true" [attr.aria-labelledby]="'dialogTitle'">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 id="dialogTitle" class="mb-0 fw-bold">{{ data?.goal ? 'Edit Goal' : 'Create Goal' }}</h4>
        <button mat-dialog-close class="btn btn-icon text-muted" aria-label="Close dialog">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label text-muted small fw-semibold" for="titleInput">Goal Title</label>
          <input id="titleInput" type="text" class="premium-input" formControlName="title" placeholder="e.g. Reduce Monthly Electricity" aria-required="true">
          <div *ngIf="goalForm.get('title')?.invalid && goalForm.get('title')?.touched" class="text-danger small mt-1">
            Goal title is required.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label text-muted small fw-semibold" for="descInput">Description</label>
          <textarea id="descInput" class="premium-input" formControlName="description" rows="3" placeholder="Describe your goal..." style="height: auto; padding-top: 0.75rem;" aria-required="true"></textarea>
          <div *ngIf="goalForm.get('description')?.invalid && goalForm.get('description')?.touched" class="text-danger small mt-1">
            Description is required.
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold" for="catInput">Category</label>
            <select id="catInput" class="premium-input" formControlName="category" aria-required="true">
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold" for="priorityInput">Priority</label>
            <select id="priorityInput" class="premium-input" formControlName="priority" aria-required="true">
              <option *ngFor="let p of priorities" [value]="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold" for="targetValueInput">Target Value</label>
            <input id="targetValueInput" type="number" class="premium-input" formControlName="targetValue" min="1" step="any" aria-required="true">
            <div *ngIf="goalForm.get('targetValue')?.invalid && goalForm.get('targetValue')?.touched" class="text-danger small mt-1">
              Must be a positive number greater than 0.
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold" for="unitInput">Measurement Unit</label>
            <input id="unitInput" type="text" class="premium-input" formControlName="measurementUnit" placeholder="e.g. kWh, days, trees" aria-required="true">
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-muted small fw-semibold" for="dateInput">Target Date</label>
          <input id="dateInput" type="date" class="premium-input" formControlName="targetDate" aria-required="true">
          <div *ngIf="goalForm.get('targetDate')?.errors?.['required'] && goalForm.get('targetDate')?.touched" class="text-danger small mt-1">
            Target date is required.
          </div>
          <div *ngIf="goalForm.get('targetDate')?.errors?.['pastDate'] && goalForm.get('targetDate')?.touched" class="text-danger small mt-1">
            Target date must be in the future.
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" mat-dialog-close aria-label="Cancel">Cancel</button>
          <button type="submit" class="premium-btn premium-btn-primary d-flex align-items-center gap-2" [disabled]="goalForm.invalid || isLoading" aria-label="Save Goal">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <lucide-icon *ngIf="!isLoading" name="save" [size]="18"></lucide-icon>
            {{ isLoading ? 'Saving...' : 'Save Goal' }}
          </button>
        </div>
      </form>
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
export class CreateGoalDialogComponent {
  goalForm: FormGroup;
  isLoading = false;
  
  categories: GoalCategory[] = ['Reduce Carbon', 'Transportation', 'Plant Trees', 'Electricity', 'Waste', 'Water', 'Food', 'Shopping', 'Travel'];
  priorities: GoalPriority[] = ['Low', 'Medium', 'High'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateGoalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { goal?: Goal }
  ) {
    this.goalForm = this.fb.group({
      title: [data?.goal?.title || '', Validators.required],
      description: [data?.goal?.description || '', Validators.required],
      category: [data?.goal?.category || 'Reduce Carbon', Validators.required],
      priority: [data?.goal?.priority || 'Medium', Validators.required],
      targetValue: [data?.goal?.targetValue || null, [Validators.required, Validators.min(0.0001)]],
      measurementUnit: [data?.goal?.measurementUnit || '', Validators.required],
      targetDate: [data?.goal?.targetDate || '', [Validators.required, futureDateValidator]]
    });
  }

  onSubmit() {
    if (this.goalForm.valid) {
      this.isLoading = true;
      // Simulate API call delay
      setTimeout(() => {
        this.dialogRef.close(this.goalForm.value);
      }, 500);
    } else {
      this.goalForm.markAllAsTouched();
    }
  }
}
