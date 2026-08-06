import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyChallengeEntry } from '../../../../../models/challenge.models';
import { ChallengeImagePipe } from '../../pipes/challenge-image.pipe';
import { ChallengeStatusBadgeComponent } from '../status-badge/challenge-status-badge.component';
import { AchievementProgressWidgetComponent } from '../progress/achievement-progress/achievement-progress.component';
import { BudgetProgressWidgetComponent } from '../progress/budget-progress/budget-progress.component';
import { getDaysRemaining } from '../../utils/date.utils';

@Component({
  selector: 'app-my-challenge-card',
  standalone: true,
  imports: [
    CommonModule, 
    ChallengeImagePipe, 
    ChallengeStatusBadgeComponent, 
    AchievementProgressWidgetComponent, 
    BudgetProgressWidgetComponent
  ],
  templateUrl: './my-challenge-card.component.html',
  styleUrls: ['./my-challenge-card.component.css']
})
export class MyChallengeCardComponent {
  @Input() entry!: MyChallengeEntry;
  @Input() compact: boolean = false;
  @Input() readonly: boolean = false;

  @Output() cardClicked = new EventEmitter<number>();

  get isAchievement(): boolean {
    return this.entry?.challenge?.challengeEvaluationType !== 'BUDGET';
  }

  get isBudget(): boolean {
    return this.entry?.challenge?.challengeEvaluationType === 'BUDGET';
  }

  get isCompleted(): boolean {
    return this.entry?.participant?.status === 'COMPLETED';
  }

  get isFailed(): boolean {
    return this.entry?.participant?.status === 'FAILED' || this.entry?.participant?.status === 'DROPPED';
  }

  get daysRemaining(): number {
    return getDaysRemaining(this.entry?.challenge?.endDate || '');
  }

  onCardClick(): void {
    if (this.entry?.challenge?.id) {
      this.cardClicked.emit(this.entry.challenge.id);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick();
    }
  }
}
