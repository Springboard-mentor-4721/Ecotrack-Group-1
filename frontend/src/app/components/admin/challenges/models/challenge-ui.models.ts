export type TrackingMethod = 'AUTOMATIC' | 'MANUAL' | 'HYBRID';
export type ProgressType = 'COUNT' | 'AMOUNT';
export type SustainabilityGroup = 'Transportation' | 'Energy' | 'Water' | 'Waste' | 'Food' | 'Community' | 'Education' | 'General';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  sustainabilityGroup: SustainabilityGroup;
  trackingMethod: TrackingMethod;
  progressType: ProgressType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationDays: number;
  rewardXp: number;
  targetValue: number;
  linkedCategoryName?: string;
  defaultAllowedActivities: string[];
  defaultIgnoredActivities: string[];
  editableFields: string[];
  icon?: string;
}

export interface CampaignPreview {
  title: string;
  description: string;
  targetValue: number;
  rewardXp: number;
  durationDays: number;
  trackingMethod: TrackingMethod;
  sustainabilityGroup: SustainabilityGroup;
  participantsEstimate?: number;
  icon?: string;
}

export interface RuleSelectionState {
  availableSubcategories: any[];
  allowedSubcategories: string[];
  blockedSubcategories: string[];
}

export interface TrackingBadge {
  method: TrackingMethod;
  label: string;
  colorClass: string;
  icon: string;
}
