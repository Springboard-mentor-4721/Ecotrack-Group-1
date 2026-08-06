import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-challenge-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-search-input.component.html'
})
export class ChallengeSearchInputComponent {
  @Input() searchText: string = '';
  @Input() isLoading: boolean = false;
  @Output() searchTextChange = new EventEmitter<string>();

  onSearchChange(value: string) {
    this.searchText = value;
    this.searchTextChange.emit(value);
  }

  clearSearch() {
    this.searchText = '';
    this.searchTextChange.emit('');
  }
}