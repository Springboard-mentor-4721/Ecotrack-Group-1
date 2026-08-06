import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-milestone-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './milestone-toast.component.html',
  styleUrls: ['./milestone-toast.component.css']
})
export class MilestoneToastComponent implements OnChanges, OnDestroy {
  @Input() milestone: number | null = null;
  @Output() dismissed = new EventEmitter<void>();

  private timeoutId: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['milestone'] && this.milestone !== null) {
      this.resetTimeout();
    }
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.dismiss();
    }, 4000);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  dismiss(): void {
    this.clearTimeout();
    this.dismissed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.milestone !== null) {
      this.dismiss();
    }
  }
}
