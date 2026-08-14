import { BadgeRarity } from './gamification.models';

export interface UserSummaryDTO {
  totalEmission: number;
  monthlyEmission: number;
  previousMonthEmission: number;
  weeklyEmission: number;
  totalEntries: number;
  weeklyEntries: number;
}

export interface GoalResponse {
  id: number;
  goalType: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  status: string;
  isAutomatic: boolean;
}

export interface GoalSummaryDTO {
  activeGoals: number;
  completedGoals: number;
  expiredGoals: number;
  completionPercentage: number;
  activeGoalsList: GoalResponse[];
}

export interface GamificationProfileDTO {
  userId: number;
  currentEcoScore: number;
  currentEcoGrade: string;
  lifetimeEcoXp: number;
  currentLevel: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntryDTO {
  userId: number;
  username: string;
  scoreValue: number;
  rank: number;
  level: number;
  xpToNextRank: number;
}

export interface ChallengeParticipantDTO {
  id: number;
  challengeId: number;
  userId: number;
  progress: number;
  status: string;
  joinedAt: string;
  challengeTitle?: string;
  targetValue?: number;
  progressMetric?: string;
}

export interface CarbonTrendDTO {
  month: string;
  emission: number;
}

export interface CategoryBreakdownDTO {
  categoryName: string;
  emission: number;
  percentage: number;
}

export interface RecentActivityDTO {
  category: string;
  subType: string;
  emission: number;
  entryDate: string;
}

export interface BadgeDTO {
  id: number;
  name: string;
  category: string;
  description: string;
  rarity: BadgeRarity;
  type: string;
  icon?: string;
  color?: string;
  isEarned: boolean;
  awardedAt: string;
}

export interface DashboardSummaryDTO {
  userSummary: UserSummaryDTO;
  goalSummary: GoalSummaryDTO;
  gamificationProfile: GamificationProfileDTO;
  leaderboardRank: LeaderboardEntryDTO;
  monthlyLeaderboardRank?: LeaderboardEntryDTO;
  activeChallenges: ChallengeParticipantDTO[];
  monthlyTrend: CarbonTrendDTO[];
  categoryBreakdown: CategoryBreakdownDTO[];
  recentActivities: RecentActivityDTO[];
  recentBadges: BadgeDTO[];
}
