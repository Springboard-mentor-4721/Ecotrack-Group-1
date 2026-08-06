import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-challenges-header',
  standalone: true,
  templateUrl: './my-challenges-header.component.html'
})
export class MyChallengesHeaderComponent {
  @Output() exploreClicked = new EventEmitter<void>();
}