export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED';
export type ChallengeParticipantStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';
export type ProgressType = 'COUNT' | 'AMOUNT';

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
  communityProgress: number;
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
}

export interface ChallengeProgressUpdateRequest {
  delta: number;
}
