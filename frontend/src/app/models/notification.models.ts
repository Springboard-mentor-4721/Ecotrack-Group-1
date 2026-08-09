export type NotificationType = 'BADGE' | 'GOAL' | 'CHALLENGE' | 'LEVEL_UP' | 'STREAK_MILESTONE';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
  correlationId: string | null;
}

export interface NotificationPreference {
  eventType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}
