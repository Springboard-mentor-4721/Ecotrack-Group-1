import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-challenge-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './challenge-config.html',
  styleUrl: './challenge-config.css'
})
export class ChallengeConfig {
  @Input() challengeForm!: FormGroup;
  @Input() categories: any[] = [];
  @Input() supportsRules: boolean = false;
  @Input() supportsInstructions: boolean = false;
  @Output() categoryChanged = new EventEmitter<number | null>();

  onCategorySelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const val = target.value ? Number(target.value) : null;
    this.categoryChanged.emit(val);
  }
}
