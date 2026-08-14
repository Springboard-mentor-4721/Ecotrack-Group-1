import { PageableResponse } from './carbon.models';

export type GoalStatus = 'ACTIVE' | 'ACHIEVED' | 'EXPIRED' | 'ABANDONED';

export type GoalType = 'REDUCE_CARBON_EMISSIONS' | 'REDUCE_WATER_USAGE' | 'REDUCE_ELECTRICITY_CONSUMPTION' | 'USE_PUBLIC_TRANSPORT' | 'INCREASE_RECYCLING' | 'REDUCE_PLASTIC_USAGE' | 'PLANT_TREES';

export interface GoalRequest {
  goalType: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  targetDate: string; // YYYY-MM-DD
}

export interface GoalResponse {
  id: number;
  userId: number;
  goalType: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string; // YYYY-MM-DD
  status: GoalStatus;
  isAutomatic: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface GoalProgressResponse {
  id: number;
  goalId: number;
  value: number;
  note?: string;
  createdAt: string; // ISO date string
}

export interface GoalHistoryItem {
  type: 'AUTOMATIC' | 'MANUAL';
  timestamp: string; // ISO date string
  title: string;
  description?: string;
  source: string;
  progressChange: number;
  currentProgress: number;
}

export interface GoalProgressRequest {
  progressValue: number;
  notes?: string;
}

export interface GoalAnalyticsResponse {
  progressPercentage: number;
  projectedCompletionDate?: string;
  history: GoalHistoryItem[];
}

export interface GoalOptimizationResponse {
  feasibility: 'ACHIEVABLE' | 'CONSERVATIVE' | 'AGGRESSIVE';
  suggestedTarget: number;
  explanation: string;
}
