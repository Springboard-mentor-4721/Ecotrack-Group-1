import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GamificationSyncService } from '../../../services/gamification-sync.service';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.css']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];

  private toastSub?: Subscription;

  constructor(
    private toastService: ToastService,
    private gamificationSyncService: GamificationSyncService
  ) {}

  ngOnInit(): void {
    // Start gamification synchronization
    this.gamificationSyncService.startSync();

    this.toastSub = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      // Handle auto-hide for regular toasts
      for (const t of this.toasts) {
        if (t.autoHide) {
          setTimeout(() => this.remove(t.id), 3000);
          t.autoHide = false; // Prevent multiple timeouts
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastSub) {
      this.toastSub.unsubscribe();
    }
    this.gamificationSyncService.stopSync();
  }

  remove(id: string): void {
    this.toastService.remove(id);
  }

  getGroupedNotifications(toast: ToastMessage) {
    if (!toast.notifications) return [];
    return toast.notifications;
  }
}
