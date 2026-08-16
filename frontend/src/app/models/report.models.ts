export interface OverviewReportDTO {
    startDate: string;
    endDate: string;
    totalEmissions: number;
    activeGoals: number;
    completedGoals: number;
    completedChallenges: number;
    periodXpEarned: number;
    currentEcoScore: number;
    currentLevel: number;
}

export interface XpTransactionDTO {
    id: number;
    amount: number;
    source: string;
    description: string;
    timestamp: string;
}

export interface XpActivityPageDTO {
    startDate: string;
    endDate: string;
    periodXpEarned: number;
    transactions: XpTransactionDTO[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface CarbonReportDTO {
    startDate: string;
    endDate: string;
    totalEmissions: number;
    emissionsByCategory: { [key: string]: number };
    entries: {
        date: string;
        category: string;
        subCategory: string;
        emission: number;
        description: string;
    }[];
}

export interface GoalReportDTO {
    startDate: string;
    endDate: string;
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
    details: {
        goalId: number;
        title: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        status: string;
        progressPercentage: number;
    }[];
}

export interface ChallengeReportDTO {
    startDate: string;
    endDate: string;
    totalParticipated: number;
    completedChallenges: number;
    completionRate: number;
    totalXpEarned: number;
    details: {
        challengeId: number;
        title: string;
        status: string;
        xpReward: number;
        joinedAt: string;
        completedAt: string;
    }[];
}

export interface SustainabilityReportDTO {
    startDate: string;
    endDate: string;
    totalEmissions: number;
    totalGoals: number;
    completedGoals: number;
    completedChallenges: number;
    xpEarned: number;
    currentEcoScore: number;
    currentRank: string;
}

export interface CarbonTrendPointDTO {
  date: string;
  emission: number;
}

export interface CarbonCategoryRankingDTO {
  rank: number;
  category: string;
  absoluteEmissions: number;
  percentage: number;
}

export interface CarbonAnalyticsDTO {
  startDate: string;
  endDate: string;
  totalEmissions: number;
  averagePerDay: number;
  highestCategory: string | null;
  entryCount: number;
  previousPeriodTotal: number;
  changePercentage: number;
  direction: 'IMPROVED' | 'INCREASED' | 'NO_CHANGE' | 'NO_PREVIOUS_DATA';
  trend: CarbonTrendPointDTO[];
  categoryRankings: CarbonCategoryRankingDTO[];
  insights: string[];
}

export interface CarbonEntryDTO {
  date: string;
  activity: string;
  category: string;
  amount: string;
  emissions: number;
}

export interface CarbonEntryPageDTO {
  startDate: string;
  endDate: string;
  entries: CarbonEntryDTO[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface GoalProgressTrendDTO {
  date: string;
  progressValue: number;
}

export interface GoalAttentionDTO {
  goalId: number;
  goalName: string;
  reason: string;
}

export interface GoalAnalyticsDTO {
  startDate: string;
  endDate: string;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  completionRate: number;
  totalProgressMade: number;
  previousPeriodProgress: number;
  progressChangePercentage: number;
  progressDirection: 'IMPROVED' | 'DECREASED' | 'NO_PREVIOUS_DATA' | 'NO_CHANGE';
  statusDistribution: { [key: string]: number };
  progressTrend: GoalProgressTrendDTO[];
  needsAttention: GoalAttentionDTO[];
  insights: string[];
}

export interface GoalPerformanceDTO {
  goalId: number;
  goalName: string;
  goalType: string;
  isAutomatic: boolean;
  targetValue: number;
  unit: string;
  
  // Manual Goal fields
  progressInPeriod: number;
  cumulativeProgress: number;
  progressPercentage: number;
  
  // Automatic Budget fields
  budgetUsedInPeriod: number;
  budgetCumulativeUsed: number;
  budgetRemaining: number;
  budgetUsagePercentage: number;
  
  targetDate: string;
  status: string;
  needsAttention: boolean;
}

export interface GoalPerformancePageDTO {
  startDate: string;
  endDate: string;
  goals: GoalPerformanceDTO[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}


export interface ChallengeAnalyticsDTO {
  startDate: string;
  endDate: string;
  totalParticipated: number;
  completedChallenges: number;
  failedChallenges: number;
  completionRate: number;
  totalXpEarned: number;
  previousPeriodCompleted: number;
  completionChangePercentage: number;
  completionDirection: string;
  previousPeriodXp: number;
  xpChangePercentage: number;
  xpDirection: string;
  statusDistribution: { [key: string]: number };
  completionTrend: ChallengeTrendDTO[];
  insights: string[];
}

export interface ChallengeTrendDTO {
  date: string;
  count: number;
}

export interface ChallengePerformancePageDTO {
  startDate: string;
  endDate: string;
  challenges: ChallengePerformanceDTO[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface ChallengePerformanceDTO {
  challengeId: number;
  title: string;
  category: string;
  joinedDate: string;
  completedDate: string;
  status: string;
  rewardXp: number;
  progressPercentage: number;
}


export interface SustainabilityAnalyticsDTO {
  startDate: string;
  endDate: string;
  totalEmissions: number;
  previousPeriodEmissions: number;
  emissionChangePercentage: number;
  emissionDirection: string;
  completedGoals: number;
  activeGoals: number;
  previousCompletedGoals: number;
  completedChallenges: number;
  participatedChallenges: number;
  previousCompletedChallenges: number;
  periodXpEarned: number;
  previousPeriodXpEarned: number;
  currentEcoScore: number;
  currentLevel: number;
  currentStreak: number;
  insights: string[];
  recommendedFocus: string;
}
