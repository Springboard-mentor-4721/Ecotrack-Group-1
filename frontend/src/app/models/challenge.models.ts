export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED';
export type ChallengeParticipantStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHIN_BUDGET' | 'EXCEEDED' | 'FAILED';
export type ProgressMetric = 'CARBON_EMISSION' | 'QUANTITY' | 'ENTRY_COUNT';
export type TrackingMethod = 'AUTOMATIC' | 'MANUAL';

import { AdminBadge } from './gamification.models';

export interface ChallengeRules {
  allowedSubcategoryIds?: number[];
  blockedSubcategoryIds?: number[];
}

export interface Challenge {
  id: number;
  title: string;
  description: string;

  status: ChallengeStatus;
  targetValue: number;
  startDate: string;
  endDate: string;
  linkedCategoryId?: number;
  carbonCategoryCode?: string;
  rewardXp: number;
  progressMetric: ProgressMetric;
  trackingMethod: 'AUTOMATIC' | 'MANUAL';
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  rulesConfig?: ChallengeRules;
  globalProgress: number;
  derivedUnit?: string;
  participantCount?: number;
  imageUrl?: string;
  badge?: AdminBadge;
}

export interface ChallengeDetail extends Challenge {
  participantCount: number;
  userProgress: ChallengeParticipant | null;
}

export interface ChallengeParticipant {
  id: number;
  challengeId: number;
  userId: number;
  userName?: string;
  progress: number;
  status: ChallengeParticipantStatus;
  joinedAt: string;
  completedAt: string | null;
  challengeTitle?: string;
  targetValue?: number;
  progressMetric?: ProgressMetric;
  challenge?: ChallengeDetail;
}

export interface MyChallengeEntry {
  participant: ChallengeParticipant;
  challenge: ChallengeDetail;
}

export interface ChallengeRequest {
  title: string;
  description: string;

  targetValue: number;
  startDate: string;
  endDate: string;
  linkedCategoryId?: number;
  carbonCategoryCode?: string;
  rewardXp: number;
  progressMetric: ProgressMetric;
  trackingMethod: TrackingMethod;
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  rulesConfig?: ChallengeRules | null;
  imageUrl?: string;
  badgeId?: number;
}

export interface ChallengeProgressUpdateRequest {
  delta: number;
}

export interface ChallengeStats {
  totalChallenges: number;
  activeCount: number;
  scheduledCount: number;
  completedCount: number;
  archivedCount: number;
  totalParticipants: number;
  completionRate?: number;
  xpDistributed?: number;
  co2Impact?: number;
  totalChallengesTrend?: number;
  activeCountTrend?: number;
  scheduledCountTrend?: number;
  draftCount?: number;
  draftCountTrend?: number;
}

export interface ChallengeAnalytics {
  challengesByStatus: { [key: string]: number };
  participationByMonth: { [key: string]: number };
}

export type ChallengeEvaluationType = 'ACHIEVEMENT' | 'BUDGET';

