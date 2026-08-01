import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../../models/challenge.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-card.html',
  styleUrl: './challenge-card.css'
})
export class ChallengeCard {
  @Input() challenge!: Challenge;
  @Output() edit = new EventEmitter<Challenge>();

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.challenge);
  }
}
