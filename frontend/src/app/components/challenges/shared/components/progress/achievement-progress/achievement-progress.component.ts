import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievement-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-progress.component.html',
  styleUrls: ['./achievement-progress.component.css']
})
export class AchievementProgressWidgetComponent implements OnChanges {
  @Input() progress: number = 0;
  @Input() target: number = 100;
  @Input() unit: string = '';
  @Input() variant: 'full' | 'mini' = 'full';

  @Output() milestoneReached = new EventEmitter<25 | 50 | 75 | 100>();

  private firedMilestones = new Set<number>();
  
  get percentage(): number {
    if (this.target <= 0) return 0;
    const p = (this.progress / this.target) * 100;
    return Math.min(Math.max(p, 0), 100);
  }

  get isCompleted(): boolean {
    return this.percentage >= 100;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress'] || changes['target']) {
      this.checkMilestones();
    }
  }

  private checkMilestones(): void {
    const currentPercentage = this.percentage;
    const thresholds: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];

    thresholds.forEach(threshold => {
      if (currentPercentage >= threshold && !this.firedMilestones.has(threshold)) {
        this.firedMilestones.add(threshold);
        this.milestoneReached.emit(threshold);
      }
    });
  }

  hasPassedMilestone(threshold: number): boolean {
    return this.percentage >= threshold;
  }
}
