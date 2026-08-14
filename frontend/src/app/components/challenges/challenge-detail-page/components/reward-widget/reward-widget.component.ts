import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetail } from '../../../../../models/challenge.models';
import { BadgeEmblemComponent } from '../../../../../shared/components/badge-emblem/badge-emblem.component';

@Component({
  selector: 'app-reward-widget',
  standalone: true,
  imports: [CommonModule, BadgeEmblemComponent],
  templateUrl: './reward-widget.component.html'
})
export class RewardWidgetComponent {
  @Input() challenge: any;
}