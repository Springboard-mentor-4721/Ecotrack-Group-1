export interface UserSummaryDTO {
  totalEmission: number;
  monthlyEmission: number;
  weeklyEmission: number;
  totalEntries: number;
}

export interface GoalSummaryDTO {
  activeGoals: number;
  completedGoals: number;
  expiredGoals: number;
  completionPercentage: number;
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

export interface EcoScoreDTO {
  score: number;
  grade: string;
}

export interface DashboardResponse {
  userSummary: UserSummaryDTO;
  goalSummary: GoalSummaryDTO;
  monthlyTrend: CarbonTrendDTO[];
  categoryBreakdown: CategoryBreakdownDTO[];
  recentActivities: RecentActivityDTO[];
  ecoScore: EcoScoreDTO;
}
