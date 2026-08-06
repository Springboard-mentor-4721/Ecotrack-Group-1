import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeImagePipe } from '../../../shared/pipes/challenge-image.pipe';

@Component({
  selector: 'app-reward-widget',
  standalone: true,
  imports: [CommonModule, ChallengeImagePipe],
  templateUrl: './reward-widget.component.html'
})
export class RewardWidgetComponent {
  @Input() challenge: any;
}