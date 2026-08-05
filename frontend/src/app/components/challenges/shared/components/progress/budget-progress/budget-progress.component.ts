import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-progress.component.html',
  styleUrls: ['./budget-progress.component.css']
})
export class BudgetProgressWidgetComponent implements OnChanges {
  @Input() progress: number = 0;
  @Input() target: number = 100;
  @Input() unit: string = '';
  @Input() challengeStartDate!: string;
  @Input() challengeEndDate!: string;
  @Input() variant: 'full' | 'mini' = 'full';

  @Output() budgetCritical = new EventEmitter<boolean>();

  private wasCritical: boolean = false;

  get percentageUsed(): number {
    if (this.target <= 0) return 0;
    const p = (this.progress / this.target) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  get remaining(): number {
    return this.target - this.progress;
  }

  get totalDays(): number {
    if (!this.challengeStartDate || !this.challengeEndDate) return 1;
    const start = new Date(this.challengeStartDate);
    const end = new Date(this.challengeEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  get dailyAllowance(): number {
    return this.target / this.totalDays;
  }

  get riskLevel(): 'safe' | 'caution' | 'critical' | 'exceeded' {
    const p = (this.progress / this.target) * 100;
    if (p < 60) return 'safe';
    if (p < 80) return 'caution';
    if (p <= 100) return 'critical';
    return 'exceeded';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress'] || changes['target']) {
      this.checkCriticalState();
    }
  }

  private checkCriticalState(): void {
    const isCritical = this.riskLevel === 'critical' || this.riskLevel === 'exceeded';
    if (isCritical !== this.wasCritical) {
      this.wasCritical = isCritical;
      this.budgetCritical.emit(isCritical);
    }
  }
}
