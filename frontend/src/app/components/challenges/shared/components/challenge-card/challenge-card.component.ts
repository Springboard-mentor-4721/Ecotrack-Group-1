import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Challenge } from '../../../../../models/challenge.models';
import { ChallengeImagePipe } from '../../pipes/challenge-image.pipe';

import { getDaysRemaining } from '../../utils/date.utils';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ChallengeImagePipe],
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.css']
})
export class ChallengeCardComponent {
  @Input() challenge!: Challenge;
  @Input() index: number = 0;
  
  // Presentation configuration from parent
  @Input() isUrgent: boolean = false;
  @Input() isWarning: boolean = false;

  get daysRemaining(): number {
    return getDaysRemaining(this.challenge?.endDate);
  }
}
