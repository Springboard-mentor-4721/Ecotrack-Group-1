import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../../models/notification.models';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward';
  message?: string;
  notifications?: Notification[]; // For 'reward' type
  autoHide: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  success(message: string): void {
    this.add({
      id: this.generateId(),
      type: 'success',
      message,
      autoHide: true
    });
  }

  error(message: string): void {
    this.add({
      id: this.generateId(),
      type: 'error',
      message,
      autoHide: true
    });
  }

  info(message: string): void {
    this.add({
      id: this.generateId(),
      type: 'info',
      message,
      autoHide: true
    });
  }

  showGamification(notifications: Notification[]): void {
    const currentToasts = [...this.toastsSubject.value];
    
    for (const notif of notifications) {
      if (notif.correlationId) {
        // Find existing reward toast with this correlation ID
        const existingReward = currentToasts.find(t => 
          t.type === 'reward' && 
          t.notifications && 
          t.notifications.some(n => n.correlationId === notif.correlationId)
        );

        if (existingReward && existingReward.notifications) {
          // Avoid duplicates
          if (!existingReward.notifications.find(n => n.id === notif.id)) {
            existingReward.notifications.push(notif);
          }
        } else {
          // Create new grouped reward
          currentToasts.push({
            id: this.generateId(),
            type: 'reward',
            notifications: [notif],
            autoHide: false // Gamification celebrations should stick around or have a longer timeout
          });
        }
      } else {
        // Ungroupable
        currentToasts.push({
          id: this.generateId(),
          type: 'reward',
          notifications: [notif],
          autoHide: false
        });
      }
    }

    this.toastsSubject.next(currentToasts);
  }

  remove(id: string): void {
    const filtered = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }

  private add(toast: ToastMessage): void {
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
