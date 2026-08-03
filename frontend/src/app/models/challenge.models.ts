export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED';
export type ChallengeParticipantStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';
export type ProgressType = 'COUNT' | 'AMOUNT';
export type TrackingMethod = 'AUTOMATIC' | 'MANUAL' | 'HYBRID';

export interface ChallengeRules {
  allowedSubcategories?: number[];
  blockedSubcategories?: number[];
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  typeCode: string;
  status: ChallengeStatus;
  targetValue: number;
  startDate: string;
  endDate: string;
  linkedCategoryId?: number;
  rewardXp: number;
  progressType: ProgressType;
  trackingMethod: 'AUTOMATIC' | 'MANUAL';
  rulesConfig?: ChallengeRules;
  communityProgress: number;
  participantCount?: number;
}

export interface ChallengeDetail extends Challenge {
  participantCount: number;
  userProgress: ChallengeParticipant | null;
}

export interface ChallengeParticipant {
  id: number;
  challengeId: number;
  userId: number;
  progress: number;
  status: ChallengeParticipantStatus;
  joinedAt: string;
  completedAt: string | null;
}

export interface ChallengeRequest {
  title: string;
  description: string;
  typeCode: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  linkedCategoryId?: number;
  rewardXp: number;
  progressType: ProgressType;
  trackingMethod: TrackingMethod;
  rulesConfig?: ChallengeRules | null;
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
}

export interface ChallengeAnalytics {
  challengesByStatus: { [key: string]: number };
  participationByMonth: { [key: string]: number };
}
