import { Component, OnInit, OnDestroy, HostListener, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.models';
import { Subscription, interval, startWith, switchMap, merge } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="position-relative">
      <button class="icon-btn position-relative bg-transparent border-0" (click)="toggleDropdown()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.bell-ringing]="unreadCount() > 0">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span *ngIf="unreadCount() > 0" class="notification-badge bg-danger rounded-circle position-absolute border border-2 border-white" style="width: 10px; height: 10px; top: 0; right: 0;"></span>
      </button>

      <div *ngIf="isDropdownOpen()" class="dropdown-menu dropdown-menu-end shadow border rounded-3 position-absolute end-0 mt-2 p-0 bg-surface d-block" style="width: 320px; z-index: 1050;">
        <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
          <span class="fw-bold fs-6 text-dark">Notifications</span>
          <span class="badge bg-emerald text-white" *ngIf="unreadCount() > 0">{{ unreadCount() }} new</span>
        </div>
        
        <div class="list-group list-group-flush" style="max-height: 350px; overflow-y: auto;">
          <div *ngIf="isLoading()" class="p-4 text-center text-muted">
            <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
            <p class="fs-xs mb-0">Loading...</p>
          </div>
          
          <div *ngIf="!isLoading() && notifications().length === 0" class="p-4 text-center text-muted">
            <p class="fs-sm mb-0">No notifications.</p>
          </div>

          <a *ngFor="let notif of notifications()" href="javascript:void(0)" (click)="markAsRead(notif)" class="list-group-item list-group-item-action p-3" [class.bg-light]="!notif.isRead">
            <div class="d-flex w-100 justify-content-between mb-1">
              <h6 class="mb-0 fs-sm fw-bold text-dark text-truncate">{{ notif.title }}</h6>
              <small class="text-muted" style="font-size: 0.7rem;">{{ notif.createdAt | date:'shortTime' }}</small>
            </div>
            <p class="mb-0 fs-xs text-muted text-truncate">{{ notif.message }}</p>
          </a>
        </div>
        
        <div class="p-2 border-top text-center bg-light">
          <a routerLink="/notifications" (click)="isDropdownOpen.set(false)" class="text-emerald fw-bold text-decoration-none fs-sm d-block py-1">View All Notifications</a>
        </div>
      </div>
    </div>
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
    .list-group-item:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = signal(0);
  isDropdownOpen = signal(false);
  notifications = signal<Notification[]>([]);
  isLoading = signal(false);
  
  private pollSub?: Subscription;

  constructor(
    private notificationService: NotificationService, 
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.pollSub = merge(
      interval(60000),
      this.notificationService.unreadCountRefresh$
    ).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({
      next: (count) => {
        this.unreadCount.set(count);
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
    if (this.isDropdownOpen()) {
      this.fetchLatestNotifications();
    }
  }

  fetchLatestNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getNotifications(0, 5).subscribe({
      next: (res) => {
        this.notifications.set(res.content);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(notif: Notification): void {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id).subscribe(() => {
        this.notifications.update(list => list.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        this.notificationService.triggerUnreadCountRefresh();
      });
    }
    this.isDropdownOpen.set(false);
  }
}
