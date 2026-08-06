import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenge-rules-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-rules-widget.component.html'
})
export class ChallengeRulesWidgetComponent {
  @Input() challenge: any;
}