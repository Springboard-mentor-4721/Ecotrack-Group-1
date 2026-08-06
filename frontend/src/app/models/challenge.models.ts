export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED';
export type ChallengeParticipantStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHIN_BUDGET' | 'EXCEEDED' | 'FAILED';
export type ProgressType = 'COUNT' | 'AMOUNT';
export type TrackingMethod = 'AUTOMATIC' | 'MANUAL' | 'HYBRID';

export interface ChallengeRules {
  allowedSubcategories?: number[];
  blockedSubcategories?: number[];
  allowedSubcategoryIds?: number[];
  blockedSubcategoryIds?: number[];
  approvalRequired?: boolean;
  submissionType?: string;
  evidenceRequired?: boolean;
  unit?: string;
  minimumEntryCount?: number;
  minimumCarbonReduction?: number;
  minimumDistance?: number;
  minimumTrips?: number;
  minimumWaste?: number;
  minimumWater?: number;
  minimumEnergy?: number;
  allowManualApproval?: boolean;
  allowPartialProgress?: boolean;
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
  carbonCategoryCode?: string;
  rewardXp: number;
  progressType: ProgressType;
  trackingMethod: 'AUTOMATIC' | 'MANUAL';
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  rulesConfig?: ChallengeRules;
  communityProgress: number;
  participantCount?: number;
  imageUrl?: string;
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
}

export interface MyChallengeEntry {
  participant: ChallengeParticipant;
  challenge: ChallengeDetail;
}

export interface ChallengeRequest {
  title: string;
  description: string;
  typeCode: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  linkedCategoryId?: number;
  carbonCategoryCode?: string;
  rewardXp: number;
  progressType: ProgressType;
  trackingMethod: TrackingMethod;
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  rulesConfig?: ChallengeRules | null;
  imageUrl?: string;
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

export interface MyChallengeEntry {
  participant: ChallengeParticipant;
  challenge: ChallengeDetail;
}
