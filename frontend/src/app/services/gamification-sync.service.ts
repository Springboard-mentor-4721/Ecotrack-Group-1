import { Injectable, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from './notification.service';
import { ToastService } from '../shared/services/toast.service';
import { Notification } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class GamificationSyncService implements OnDestroy {
  private processedIds = new Set<number>();
  private pollSub?: Subscription;
  private readonly GAMIFICATION_TYPES = ['BADGE', 'LEVEL_UP', 'GOAL', 'CHALLENGE', 'STREAK_MILESTONE'];

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  startSync(): void {
    if (this.pollSub) {
      return;
    }
    // Poll every 10 seconds. More frequent than the bell, but only fetches if we suspect unread notifications.
    // Actually, to be safe, we just poll /notifications with unreadOnly=true.
    this.pollSub = interval(10000).subscribe(() => this.checkForRewards());
    // Trigger immediate check
    this.checkForRewards();
  }

  stopSync(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopSync();
  }

  private checkForRewards(): void {
    // Fetch unread notifications
    this.notificationService.getNotifications(0, 50, true).subscribe({
      next: (res) => {
        const unreadNotifs = res.content || [];
        
        // Filter gamification ones we haven't processed yet
        const newGamificationNotifs = unreadNotifs.filter(
          (n: Notification) => 
            this.GAMIFICATION_TYPES.includes(n.type) && 
            !this.processedIds.has(n.id)
        );

        if (newGamificationNotifs.length > 0) {
          // Track them so we don't process them again in memory
          newGamificationNotifs.forEach(n => this.processedIds.add(n.id));

          // 1. Group strictly by the backend correlationId via ToastService
          this.toastService.showGamification(newGamificationNotifs);

          // 2. Synchronize read state
          newGamificationNotifs.forEach(n => {
            this.notificationService.markAsRead(n.id).subscribe({
              next: () => {
                // Also tell the bell to refresh its count
                this.notificationService.triggerUnreadCountRefresh();
              },
              error: () => {
                // If it fails, we at least processed it in memory so we won't show the toast again
              }
            });
          });
        }
      },
      error: () => {}
    });
  }
}
