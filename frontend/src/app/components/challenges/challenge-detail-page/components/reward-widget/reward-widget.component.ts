import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reward-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-widget.component.html'
})
export class RewardWidgetComponent {
  @Input() challenge: any;
}