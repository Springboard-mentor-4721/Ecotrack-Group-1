import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeDetail, ChallengeParticipant } from '../../../../../models/challenge.models';

@Component({
  selector: 'app-manual-progress-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-progress-modal.component.html',
  styleUrls: ['./manual-progress-modal.component.css']
})
export class ManualProgressModalComponent {
  @Input() isVisible = false;
  @Input({ required: true }) challenge!: ChallengeDetail | null;
  @Input() participant!: ChallengeParticipant | null | undefined;
  @Input() isValid = false;
  @Input() isActionLoading = false;
  
  constructor(private elementRef: ElementRef) {}
  
  // Local state for the input since parent validates on submit or via an output
  amount: number | null = null;

  @Output() submitProgress = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // To allow parent to validate if needed, though parent said it handles validation
  // I will emit the value and parent can do what it wants. Wait, parent handles validation, 
  // so maybe amount should be an input/output?
  @Input() customAmount: number | null = null;
  @Output() customAmountChange = new EventEmitter<number | null>();

  onAmountChange(value: number | null) {
    this.customAmount = value;
    this.customAmountChange.emit(this.customAmount);
  }

  onSubmit() {
    if (this.customAmount) {
      this.submitProgress.emit(this.customAmount);
    }
  }
  
  submitQuickCount(val: number) {
    this.submitProgress.emit(val);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (!this.isVisible) return;
    
    if (event.key === 'Escape') {
      this.close.emit();
      return;
    }

    if (event.key === 'Tab') {
      const focusableEls = this.elementRef.nativeElement.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const firstEl = focusableEls[0] as HTMLElement;
      const lastEl = focusableEls[focusableEls.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstEl) {
          lastEl?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastEl) {
          firstEl?.focus();
          event.preventDefault();
        }
      }
    }
  }
}
