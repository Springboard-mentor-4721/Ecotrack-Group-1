import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { ChallengeImagePipe } from '../../../shared/pipes/challenge-image.pipe';

@Component({
  selector: 'app-challenge-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, ChallengeImagePipe],
  templateUrl: './challenge-hero.component.html'
})
export class ChallengeHeroComponent {
  @Input({ required: true }) challenge!: ChallengeDetail;
  @Input({ required: true }) daysRemaining!: number;
  
  @Output() backClicked = new EventEmitter<void>();
}
