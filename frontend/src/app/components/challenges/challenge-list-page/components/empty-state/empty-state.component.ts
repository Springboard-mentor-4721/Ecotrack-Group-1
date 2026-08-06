import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  @Output() clearFilters = new EventEmitter<void>();
  @Output() browseAll = new EventEmitter<void>();
}
