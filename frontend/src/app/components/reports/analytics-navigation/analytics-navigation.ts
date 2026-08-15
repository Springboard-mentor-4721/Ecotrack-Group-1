import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        <button *ngFor="let tab of tabs"
                (click)="onTabClick(tab.id)"
                [class.border-emerald-500]="currentTab === tab.id"
                [class.text-emerald-600]="currentTab === tab.id"
                [class.border-transparent]="currentTab !== tab.id"
                [class.text-gray-500]="currentTab !== tab.id"
                [class.hover:text-gray-700]="currentTab !== tab.id"
                [class.hover:border-gray-300]="currentTab !== tab.id"
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors">
          {{ tab.label }}
        </button>
      </nav>
    </div>
  `
})
export class AnalyticsNavigation {
  @Input() currentTab: string = 'overview';
  @Output() tabChange = new EventEmitter<string>();

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'carbon', label: 'Carbon' },
    { id: 'goals', label: 'Goals' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'xp-activity', label: 'XP Activity' }
  ];

  onTabClick(tabId: string) {
    this.tabChange.emit(tabId);
  }
}
