export interface RulesConfig {
  allowedSubcategoryIds?: number[];
  blockedSubcategoryIds?: number[];
}

export type TrackingSourceCode = 
  | 'CAR' | 'BIKE' | 'CYCLE' | 'BUS' | 'TRAIN' | 'METRO' | 'FLIGHT' | 'WALK'
  | 'GRID_ELECTRICITY' | 'SOLAR'
  | 'PETROL' | 'DIESEL' | 'NATURAL_GAS'
  | 'BEEF' | 'CHICKEN' | 'VEGETARIAN' | 'DAIRY' | 'SEAFOOD'
  | 'LANDFILL' | 'RECYCLED'
  | 'TAP_WATER' | 'BOTTLED_WATER'
  | 'ELECTRONICS' | 'CLOTHING'
  | 'HOTEL_STAYS' | 'CRUISES' | string;


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


  defaultStatus: string;
  defaultVisibility: string;
  icon: string;
  badgeColor: string;
  badgeId?: number;
}
