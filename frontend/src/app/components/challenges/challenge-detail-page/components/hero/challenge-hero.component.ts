import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { ChallengeImagePipe } from '../../../shared/pipes/challenge-image.pipe';

@Component({
  selector: 'app-challenge-hero',
  standalone: true,
  imports: [CommonModule, ChallengeImagePipe],
  templateUrl: './challenge-hero.component.html',
  styleUrls: ['./challenge-hero.component.css']
})
export class ChallengeHeroComponent {
  @Input({ required: true }) challenge!: ChallengeDetail;
  @Input() daysRemaining = 0;

  @Output() backClicked = new EventEmitter<void>();
  @Output() shareClicked = new EventEmitter<void>();
}
