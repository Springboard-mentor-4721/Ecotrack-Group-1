export interface RulesConfig {
  allowedSubcategoryIds?: number[];
  blockedSubcategoryIds?: number[];
}

export type TrackingSourceCode = 
  | 'BUS' | 'TRAIN' | 'METRO' | 'WALK' | 'CYCLE' | 'CAR' | 'ELECTRIC_CAR' | 'MOTORBIKE'
  | 'ELECTRICITY' | 'WATER' | 'RECYCLING' | 'PLASTIC' | 'PAPER' | 'GLASS' | 'ORGANIC' | 'LANDFILL'
  | 'TREE_PLANTING' | 'COMMUNITY_EVENT' | 'DIGITAL_DETOX';


export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  category: string;
  trackingMethod: 'AUTOMATIC' | 'MANUAL';
  challengeEvaluationType?: 'ACHIEVEMENT' | 'BUDGET';
  trackingSources?: TrackingSourceCode[];
  progressMetric: 'CARBON_EMISSION' | 'QUANTITY' | 'ENTRY_COUNT';
  goalUnit: string;
  goalTarget: number;
  durationDays: number;
  rewardXP: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedCarbonImpact: number;

  defaultStatus: string;
  defaultVisibility: string;
  icon: string;
  badgeColor: string;
}
