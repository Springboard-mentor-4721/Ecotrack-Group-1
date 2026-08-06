import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-impact-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-impact-widget.component.html'
})
export class CommunityImpactWidgetComponent {
  @Input() challenge: any;
  @Input() communityProgressPercentage: number = 0;
  
  Math = Math;
}