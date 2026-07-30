import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Bell, Trophy, Target, TrendingUp, CheckCircle, Info } from 'lucide-angular';

@Component({
  selector: 'app-notification-list-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-list-page.component.html',
  styleUrls: ['./notification-list-page.component.css']
})
export class NotificationListPageComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  isMarkingAll = false;
  errorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Icons
  BellIcon = Bell;
  TrophyIcon = Trophy;
  TargetIcon = Target;
  TrendingUpIcon = TrendingUp;
  CheckCircleIcon = CheckCircle;
  InfoIcon = Info;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications(this.currentPage);
  }

  loadNotifications(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.notificationService.getNotifications(page, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.notifications = response.content;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load notifications. Please try again later.';
          console.error('Error fetching notifications', err);
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadNotifications(newPage);
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    this.notificationService.markAsRead(notification.id)
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.notificationService.triggerUnreadCountRefresh();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to mark notification as read', err);
          this.cdr.detectChanges();
        }
      });
  }

  markAllAsRead(): void {
    this.isMarkingAll = true;
    this.notificationService.markAllAsRead()
      .pipe(finalize(() => {
        this.isMarkingAll = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.notificationService.triggerUnreadCountRefresh();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to mark all notifications as read', err);
          this.cdr.detectChanges();
        }
      });
  }

  getIconForType(type: string): any {
    switch (type) {
      case 'BADGE': return this.TrophyIcon;
      case 'GOAL': return this.TargetIcon;
      case 'CHALLENGE': return this.TrendingUpIcon;
      case 'LEVEL_UP': return this.CheckCircleIcon;
      default: return this.InfoIcon;
    }
  }
}
