export interface ChallengeRules {
  allowedSubcategories?: number[];
  blockedSubcategories?: number[];
  approvalRequired?: boolean;
  submissionType?: string;
  evidenceRequired?: boolean;
  unit?: string;
}

export interface ChallengeTemplate {
  title: string;
  description: string;
  recommendedCategory: string;
  trackingMethod: 'MANUAL' | 'AUTOMATIC';
  goalType: 'COUNT' | 'AMOUNT';
  reward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendedDurationDays: number;
  icon: string;
  color: string;
  tags: string[];
  defaultRules: string;
  targetValue: number;
  carbonCategoryCode?: string;
  rulesConfig?: ChallengeRules;
}

export const DEFAULT_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // AUTOMATIC TEMPLATES
  {
    title: 'Daily Walking Challenge',
    description: 'Walk 10,000 steps a day to reduce your carbon footprint and stay healthy.',
    recommendedCategory: 'Transport',
    trackingMethod: 'AUTOMATIC',
    carbonCategoryCode: 'TRANSPORTATION',
    goalType: 'AMOUNT',
    reward: 100,
    difficulty: 'Easy',
    recommendedDurationDays: 7,
    icon: 'directions_walk',
    color: '#10b981',
    tags: ['Health', 'Transport', 'Daily'],
    defaultRules: 'Tracked automatically via walking entries.',
    targetValue: 70000,
    rulesConfig: { unit: 'steps' }
  },
  {
    title: 'Bike Instead of Car',
    description: 'Use a bicycle for your daily commute instead of a car.',
    recommendedCategory: 'Transport',
    trackingMethod: 'AUTOMATIC',
    carbonCategoryCode: 'TRANSPORTATION',
    goalType: 'AMOUNT',
    reward: 200,
    difficulty: 'Medium',
    recommendedDurationDays: 14,
    icon: 'pedal_bike',
    color: '#3b82f6',
    tags: ['Transport', 'Health'],
    defaultRules: 'Tracked automatically via cycling entries.',
    targetValue: 50,
    rulesConfig: { unit: 'km' }
  },
  {
    title: 'Electricity Saver',
    description: 'Reduce your daily grid electricity consumption.',
    recommendedCategory: 'Energy',
    trackingMethod: 'AUTOMATIC',
    carbonCategoryCode: 'ELECTRICITY',
    goalType: 'AMOUNT',
    reward: 150,
    difficulty: 'Medium',
    recommendedDurationDays: 30,
    icon: 'bolt',
    color: '#eab308',
    tags: ['Energy', 'Home'],
    defaultRules: 'Tracked automatically via electricity logs.',
    targetValue: 100,
    rulesConfig: { unit: 'kWh' }
  },
  {
    title: 'Water Saver',
    description: 'Reduce your daily water consumption.',
    recommendedCategory: 'Resource',
    trackingMethod: 'AUTOMATIC',
    carbonCategoryCode: 'WATER',
    goalType: 'AMOUNT',
    reward: 120,
    difficulty: 'Easy',
    recommendedDurationDays: 30,
    icon: 'water_drop',
    color: '#0ea5e9',
    tags: ['Resource', 'Home'],
    defaultRules: 'Tracked automatically via water usage logs.',
    targetValue: 500,
    rulesConfig: { unit: 'liters' }
  },
  {
    title: 'Zero Plastic Purchases',
    description: 'Avoid single-use plastic for a whole week.',
    recommendedCategory: 'Waste',
    trackingMethod: 'AUTOMATIC',
    carbonCategoryCode: 'WASTE',
    goalType: 'COUNT',
    reward: 150,
    difficulty: 'Medium',
    recommendedDurationDays: 7,
    icon: 'recycling',
    color: '#f59e0b',
    tags: ['Waste', 'Habit'],
    defaultRules: 'Tracked automatically via waste logs.',
    targetValue: 7,
    rulesConfig: { unit: 'days' }
  },

  // MANUAL TEMPLATES
  {
    title: 'Tree Plantation',
    description: 'Plant a tree and nurture it.',
    recommendedCategory: 'Nature',
    trackingMethod: 'MANUAL',
    goalType: 'COUNT',
    reward: 500,
    difficulty: 'Hard',
    recommendedDurationDays: 30,
    icon: 'park',
    color: '#22c55e',
    tags: ['Nature', 'Community'],
    defaultRules: 'Log the number of trees planted with photo evidence.',
    targetValue: 1,
    rulesConfig: { approvalRequired: true, submissionType: 'PHOTO', evidenceRequired: true, unit: 'trees' }
  },
  {
    title: 'Beach Cleanup',
    description: 'Participate in a local beach cleanup.',
    recommendedCategory: 'Community',
    trackingMethod: 'MANUAL',
    goalType: 'AMOUNT',
    reward: 300,
    difficulty: 'Hard',
    recommendedDurationDays: 1,
    icon: 'cleaning_services',
    color: '#f43f5e',
    tags: ['Community', 'Event'],
    defaultRules: 'Upload photos of the collected waste.',
    targetValue: 10,
    rulesConfig: { approvalRequired: true, submissionType: 'PHOTO/TEXT', evidenceRequired: true, unit: 'kg' }
  },
  {
    title: 'Community Awareness',
    description: 'Host or participate in an eco-awareness campaign.',
    recommendedCategory: 'Community',
    trackingMethod: 'MANUAL',
    goalType: 'COUNT',
    reward: 200,
    difficulty: 'Medium',
    recommendedDurationDays: 7,
    icon: 'campaign',
    color: '#8b5cf6',
    tags: ['Community', 'Education'],
    defaultRules: 'Submit details of the awareness event.',
    targetValue: 1,
    rulesConfig: { approvalRequired: true, submissionType: 'TEXT', evidenceRequired: true, unit: 'events' }
  },
  {
    title: 'Office Green Initiative',
    description: 'Reduce paper usage and save energy at work.',
    recommendedCategory: 'Office',
    trackingMethod: 'MANUAL',
    goalType: 'COUNT',
    reward: 250,
    difficulty: 'Medium',
    recommendedDurationDays: 30,
    icon: 'business',
    color: '#64748b',
    tags: ['Office', 'Organization'],
    defaultRules: 'Log successful eco-friendly office days.',
    targetValue: 20,
    rulesConfig: { approvalRequired: false, submissionType: 'TEXT', evidenceRequired: false, unit: 'days' }
  }
];
