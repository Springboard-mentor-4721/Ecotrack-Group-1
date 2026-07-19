export type GoalCategory = 'Reduce Carbon' | 'Transportation' | 'Plant Trees' | 'Electricity' | 'Waste' | 'Water' | 'Food' | 'Shopping' | 'Travel';

export type GoalStatus = 'In Progress' | 'Completed' | 'Pending';

export type GoalPriority = 'Low' | 'Medium' | 'High';

export interface GoalProgressEntry {
  id: string;
  date: string;
  value: number;
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  
  currentValue: number;
  targetValue: number;
  measurementUnit: string;
  
  progressPercentage: number;
  
  createdDate: string;
  targetDate: string;
  
  progressHistory: GoalProgressEntry[];
  recentActivity: string[];
}
