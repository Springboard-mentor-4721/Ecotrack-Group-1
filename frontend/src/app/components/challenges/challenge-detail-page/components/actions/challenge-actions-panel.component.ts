import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { ChallengeStatusBadgeComponent } from '../../../shared/components/status-badge/challenge-status-badge.component';
import { AchievementProgressWidgetComponent } from '../../../shared/components/progress/achievement-progress/achievement-progress.component';
import { BudgetProgressWidgetComponent } from '../../../shared/components/progress/budget-progress/budget-progress.component';
import { LucideAngularModule, Rocket } from 'lucide-angular';

@Component({
  selector: 'app-challenge-actions-panel',
  standalone: true,
  imports: [
    CommonModule, 
    ChallengeStatusBadgeComponent, 
    AchievementProgressWidgetComponent, 
    BudgetProgressWidgetComponent,
    LucideAngularModule
  ],
  templateUrl: './challenge-actions-panel.component.html',
  styleUrls: ['./challenge-actions-panel.component.css']
})
export class ChallengeActionsPanelComponent {
  @Input({ required: true }) challenge!: ChallengeDetail;
  @Input() isActionLoading = false;

  @Output() joinClicked = new EventEmitter<void>();
  @Output() logProgressClicked = new EventEmitter<void>();
  @Output() milestoneReached = new EventEmitter<number>();
  
  readonly RocketIcon = Rocket;
}
