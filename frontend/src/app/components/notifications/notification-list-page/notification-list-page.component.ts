import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.models';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Bell, Trophy, Target, TrendingUp, CircleCheck, Info } from 'lucide-angular';

@Component({
  selector: 'app-notification-list-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-list-page.component.html',
  styleUrls: ['./notification-list-page.component.css']
})
export class NotificationListPageComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  isLoading = signal(false);
  isMarkingAll = signal(false);
  errorMessage = signal('');
  filterType = signal<'ALL' | 'UNREAD'>('ALL');

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  // Icons
  BellIcon = Bell;
  TrophyIcon = Trophy;
  TargetIcon = Target;
  TrendingUpIcon = TrendingUp;
  CircleCheckIcon = CircleCheck;
  InfoIcon = Info;

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications(this.currentPage());
  }

  loadNotifications(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const unreadOnly = this.filterType() === 'UNREAD';
    
    this.notificationService.getNotifications(page, this.pageSize(), unreadOnly)
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (response) => {
          this.notifications.set(response.content);
          this.currentPage.set(response.number);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (err) => {
          this.errorMessage.set('Failed to load notifications. Please try again later.');
          console.error('Error fetching notifications', err);
        }
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.loadNotifications(newPage);
    }
  }

  setFilter(filter: 'ALL' | 'UNREAD'): void {
    if (this.filterType() !== filter) {
      this.filterType.set(filter);
      this.currentPage.set(0);
      this.loadNotifications(0);
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    
    this.notificationService.markAsRead(notification.id)
      .subscribe({
        next: () => {
          this.notifications.update(list => list.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
          this.notificationService.triggerUnreadCountRefresh();
        },
        error: (err) => {
          console.error('Failed to mark notification as read', err);
        }
      });
  }

  markAllAsRead(): void {
    this.isMarkingAll.set(true);
    this.notificationService.markAllAsRead()
      .pipe(finalize(() => {
        this.isMarkingAll.set(false);
      }))
      .subscribe({
        next: () => {
          this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
          this.notificationService.triggerUnreadCountRefresh();
        },
        error: (err) => {
          console.error('Failed to mark all notifications as read', err);
        }
      });
  }

  getIconForType(type: string): any {
    switch (type) {
      case 'BADGE': return this.TrophyIcon;
      case 'GOAL': return this.TargetIcon;
      case 'CHALLENGE': return this.TrendingUpIcon;
      case 'LEVEL_UP': return this.CircleCheckIcon;
      default: return this.InfoIcon;
    }
  }
}
