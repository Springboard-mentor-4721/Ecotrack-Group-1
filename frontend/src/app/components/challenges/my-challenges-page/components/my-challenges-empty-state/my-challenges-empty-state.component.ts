import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabType } from '../../my-challenges-page.component';

@Component({
  selector: 'app-my-challenges-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-challenges-empty-state.component.html'
})
export class MyChallengesEmptyStateComponent {
  @Input() currentTab: TabType = 'ACTIVE';
  @Output() exploreClicked = new EventEmitter<void>();
}