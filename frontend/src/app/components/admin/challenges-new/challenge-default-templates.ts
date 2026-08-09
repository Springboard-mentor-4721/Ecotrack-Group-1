import { ChallengeTemplate } from '../../../models/challenge-template.model';

export const DEFAULT_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'custom-challenge',
    title: 'Custom Challenge',
    description: 'This is the fallback template. Build a completely custom challenge.',
    imagePath: 'uploads/challenge-images/Custom Challenge (Generic Image).png',
    category: 'Generic',
    trackingMethod: 'MANUAL',
    challengeEvaluationType: 'ACHIEVEMENT',
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'custom',
    goalTarget: 10,
    durationDays: 7,
    rewardXP: 100,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'build',
    badgeColor: '#64748b'
  },
  {
    id: 'beach-cleanup',
    title: 'Beach Cleanup Drive',
    description: 'Join a community beach cleanup and help remove plastic waste from coastal areas.',
    imagePath: 'uploads/challenge-images/Beach cleanup.png',
    category: 'Community',
    trackingMethod: 'MANUAL',
    challengeEvaluationType: 'ACHIEVEMENT',
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'events',
    goalTarget: 1,
    durationDays: 7,
    rewardXP: 300,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'cleaning_services',
    badgeColor: '#10b981'
  },
  {
    id: 'carbon-reduction',
    title: 'Carbon Reduction Challenge',
    description: 'This challenge aggregates carbon reductions across all supported carbon entry modules. It is a carbon-emission budget that you should try to stay under.',
    imagePath: 'uploads/challenge-images/Carbon Reduction Challenge.png',
    category: 'Overall Sustainability',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'BUDGET',
    progressMetric: 'CARBON_EMISSION',
    goalUnit: 'kgCO2e',
    goalTarget: 50,
    durationDays: 30,
    rewardXP: 600,
    difficulty: 'Advanced',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'co2',
    badgeColor: '#3b82f6'
  },
  {
    id: 'car-free-weekend',
    title: 'Car-Free Weekend',
    description: 'Avoid private-car travel and keep your car usage at 0 km during the challenge.',
    imagePath: 'uploads/challenge-images/Car-Free Weekend.png',
    category: 'Transportation',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'BUDGET',
    trackingSources: ['CAR'],
    progressMetric: 'QUANTITY',
    goalUnit: 'km',
    goalTarget: 0,
    durationDays: 2,
    rewardXP: 180,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'directions_car_filled',
    badgeColor: '#10b981'
  },
  {
    id: 'community-cleanup',
    title: 'Community Cleanup',
    description: 'Organize or participate in a local community cleanup event.',
    imagePath: 'uploads/challenge-images/Community Cleanup.png',
    category: 'Community',
    trackingMethod: 'MANUAL',
    challengeEvaluationType: 'ACHIEVEMENT',
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'events',
    goalTarget: 1,
    durationDays: 7,
    rewardXP: 300,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'group',
    badgeColor: '#10b981'
  },
  {
    id: 'cycle-to-work',
    title: 'Cycle to Work',
    description: 'Cycle entries only.',
    imagePath: 'uploads/challenge-images/Cycle to Work.png',
    category: 'Transportation',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'ACHIEVEMENT',
    trackingSources: ['CYCLE'],
    progressMetric: 'QUANTITY',
    goalUnit: 'km',
    goalTarget: 40,
    durationDays: 7,
    rewardXP: 220,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'pedal_bike',
    badgeColor: '#10b981'
  },
  {
    id: 'digital-detox',
    title: 'Digital Detox Week',
    description: 'Reduce screen time and disconnect from digital devices.',
    imagePath: 'uploads/challenge-images/Digital Detox Week.png',
    category: 'Lifestyle',
    trackingMethod: 'MANUAL',
    challengeEvaluationType: 'ACHIEVEMENT',
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'days',
    goalTarget: 7,
    durationDays: 7,
    rewardXP: 180,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'phonelink_off',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'eco-commute',
    title: 'Eco Commute Challenge',
    description: 'Log your eco-friendly commute distances (walking, cycling, or public transport) in km.',
    imagePath: 'uploads/challenge-images/Eco Commute Challenge.png',
    category: 'Transportation',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'ACHIEVEMENT',
    trackingSources: ['WALK', 'CYCLE', 'BUS', 'TRAIN', 'METRO'],
    progressMetric: 'QUANTITY',
    goalUnit: 'km',
    goalTarget: 20,
    durationDays: 14,
    rewardXP: 300,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'emoji_transportation',
    badgeColor: '#10b981'
  },
  {
    id: 'public-transport-week',
    title: 'Public Transport Week',
    description: 'Take the bus or train instead of driving.',
    imagePath: 'uploads/challenge-images/Public Transport Week.png',
    category: 'Transportation',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'ACHIEVEMENT',
    trackingSources: ['BUS', 'TRAIN', 'METRO'],
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'trips',
    goalTarget: 10,
    durationDays: 7,
    rewardXP: 220,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'directions_bus',
    badgeColor: '#3b82f6'
  },
  {
    id: 'reduce-waste-recycling',
    title: 'Reduce Waste & Recycling',
    description: 'Track and reduce the amount of waste sent to landfill.',
    imagePath: 'uploads/challenge-images/Reduce waste and iniate Recyling.png',
    category: 'Waste',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'BUDGET',
    trackingSources: ['LANDFILL'],
    progressMetric: 'QUANTITY',
    goalUnit: 'kg',
    goalTarget: 15,
    durationDays: 7,
    rewardXP: 180,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'recycling',
    badgeColor: '#f59e0b'
  },
  {
    id: 'save-electricity',
    title: 'Save Electricity',
    description: 'Track your electricity usage and stay below the target kWh limit.',
    imagePath: 'uploads/challenge-images/Save Electricity.png',
    category: 'Energy',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'BUDGET',
    trackingSources: ['GRID_ELECTRICITY'],
    progressMetric: 'QUANTITY',
    goalUnit: 'kWh',
    goalTarget: 25,
    durationDays: 7,
    rewardXP: 180,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'bolt',
    badgeColor: '#eab308'
  },
  {
    id: 'tree-plantation',
    title: 'Tree Plantation Campaign',
    description: 'Plant trees in your community.',
    imagePath: 'uploads/challenge-images/Tree planting.png',
    category: 'Community',
    trackingMethod: 'MANUAL',
    challengeEvaluationType: 'ACHIEVEMENT',
    progressMetric: 'ENTRY_COUNT',
    goalUnit: 'trees',
    goalTarget: 5,
    durationDays: 14,
    rewardXP: 500,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'park',
    badgeColor: '#10b981'
  },
  {
    id: 'walk-more',
    title: 'Walk More Challenge',
    description: 'Log your walking distances and reach the target amount of kilometers.',
    imagePath: 'uploads/challenge-images/Walk More Challenge.png',
    category: 'Transportation',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'ACHIEVEMENT',
    trackingSources: ['WALK'],
    progressMetric: 'QUANTITY',
    goalUnit: 'km',
    goalTarget: 30,
    durationDays: 7,
    rewardXP: 180,
    difficulty: 'Beginner',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'directions_walk',
    badgeColor: '#10b981'
  },
  {
    id: 'water-saver',
    title: 'Water Saver Challenge',
    description: 'Conserve water and stay below your water usage budget.',
    imagePath: 'uploads/challenge-images/Water Saver Challenge.png',
    category: 'Water',
    trackingMethod: 'AUTOMATIC',
    challengeEvaluationType: 'BUDGET',
    trackingSources: ['TAP_WATER', 'BOTTLED_WATER'],
    progressMetric: 'QUANTITY',
    goalUnit: 'litres',
    goalTarget: 500,
    durationDays: 7,
    rewardXP: 180,
    difficulty: 'Intermediate',

    
    defaultStatus: 'UPCOMING',
    defaultVisibility: 'PUBLIC',
    icon: 'water_drop',
    badgeColor: '#3b82f6'
  }
];
