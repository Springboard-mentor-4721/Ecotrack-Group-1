import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[14px] shadow-sm border border-gray-200 px-4">
      <div class="border-b border-gray-100">
        <nav class="-mb-px flex justify-center space-x-6 md:space-x-8 overflow-x-auto hide-scrollbar" aria-label="Tabs">
          <button *ngFor="let tab of tabs"
                  (click)="onTabClick(tab.id)"
                  [class.border-teal-500]="currentTab === tab.id"
                  [class.text-teal-600]="currentTab === tab.id"
                  [class.border-transparent]="currentTab !== tab.id"
                  [class.text-gray-500]="currentTab !== tab.id"
                  [class.hover:text-gray-700]="currentTab !== tab.id"
                  [class.hover:border-gray-300]="currentTab !== tab.id"
                  class="whitespace-nowrap py-4 px-2 border-b-2 font-bold text-sm transition-colors outline-none focus:outline-none">
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class AnalyticsNavigation {
  @Input() currentTab: string = 'overview';
  @Output() tabChange = new EventEmitter<string>();

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'carbon', label: 'Carbon' },
    { id: 'goals', label: 'Goals' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'sustainability', label: 'Eco Progress' }
  ];

  onTabClick(tabId: string) {
    this.tabChange.emit(tabId);
  }
}
