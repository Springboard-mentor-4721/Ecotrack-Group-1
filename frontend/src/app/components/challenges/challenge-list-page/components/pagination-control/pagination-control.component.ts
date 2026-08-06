import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-control.component.html'
})
export class PaginationControlComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() isLoading = false;
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
