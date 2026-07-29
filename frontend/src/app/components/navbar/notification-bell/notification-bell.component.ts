import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Subscription, interval, startWith, switchMap, merge } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="icon-btn position-relative bg-transparent border-0" (click)="toggleDropdown()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.bell-ringing]="unreadCount > 0">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span *ngIf="unreadCount > 0" class="notification-badge bg-danger rounded-circle position-absolute border border-2 border-white" style="width: 10px; height: 10px; top: 0; right: 0;"></span>
    </button>
  `,
  styles: [`
    .bell-ringing {
      animation: ring 2s infinite ease-in-out;
    }
    @keyframes ring {
      0% { transform: rotate(0); }
      5% { transform: rotate(15deg); }
      10% { transform: rotate(-15deg); }
      15% { transform: rotate(10deg); }
      20% { transform: rotate(-10deg); }
      25% { transform: rotate(5deg); }
      30% { transform: rotate(-5deg); }
      35% { transform: rotate(0); }
      100% { transform: rotate(0); }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private pollSub?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.pollSub = merge(
      interval(60000),
      this.notificationService.unreadCountRefresh$
    ).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({
      next: (count) => this.unreadCount = count,
      error: () => {} // silently swallow errors as required
    });
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  toggleDropdown(): void {
    // Dropdown functionality is pending
  }
}
