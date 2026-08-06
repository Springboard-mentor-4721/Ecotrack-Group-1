import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenge-history-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-history-summary.component.html',
  styleUrls: ['./challenge-history-summary.component.css']
})
export class ChallengeHistorySummaryComponent {
  @Input() totalCompleted: number = 0;
  @Input() totalXpEarned: number = 0;
  @Input() totalFailed: number = 0;
}
