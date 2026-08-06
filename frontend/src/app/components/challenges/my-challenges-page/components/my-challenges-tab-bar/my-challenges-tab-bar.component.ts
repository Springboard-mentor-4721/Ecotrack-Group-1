import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabType } from '../../my-challenges-page.component';

@Component({
  selector: 'app-my-challenges-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-challenges-tab-bar.component.html'
})
export class MyChallengesTabBarComponent {
  @Input() tabs: { id: TabType, label: string }[] = [];
  @Input() currentTab: TabType = 'ACTIVE';
  @Output() tabSelected = new EventEmitter<TabType>();
}