export interface RulesConfig {
  allowedSubcategoryIds?: number[];
  blockedSubcategoryIds?: number[];
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

export type TrackingSourceCode = 
  | 'BUS' | 'TRAIN' | 'METRO' | 'WALK' | 'CYCLE' | 'CAR' | 'ELECTRIC_CAR' | 'MOTORBIKE'
  | 'ELECTRICITY' | 'WATER' | 'RECYCLING' | 'PLASTIC' | 'PAPER' | 'GLASS' | 'ORGANIC'
  | 'TREE_PLANTING' | 'COMMUNITY_EVENT' | 'DIGITAL_DETOX';

export type GoalType = 'COUNT' | 'DISTANCE' | 'CO2' | 'ENERGY' | 'WATER' | 'WASTE' | 'TRIPS' | 'CUSTOM';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  category: string;
  trackingMethod: 'AUTOMATIC' | 'MANUAL';
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  trackingSources?: TrackingSourceCode[];
  goalType: GoalType;
  goalUnit: string;
  goalTarget: number;
  durationDays: number;
  rewardXP: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedCarbonImpact: number;
  defaultChallengeType: string;
  defaultStatus: string;
  defaultVisibility: string;
  defaultRules?: RulesConfig; 
  icon: string;
  badgeColor: string;
}
