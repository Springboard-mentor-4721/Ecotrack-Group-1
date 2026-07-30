export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  typeCode: string;
  progressType: 'COUNT' | 'AMOUNT';
  targetValue: number;
  rewardXp: number;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'public-transport-week',
    title: 'Public Transport Week',
    description: 'Use public transport instead of personal vehicles for a week.',
    categoryName: 'Transportation',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 7,
    rewardXp: 500
  },
  {
    id: 'cycle-to-work',
    title: 'Cycle to Work Challenge',
    description: 'Cycle to work and reduce your carbon footprint.',
    categoryName: 'Transportation',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 5,
    rewardXp: 800
  },
  {
    id: '10-days-vegan',
    title: '10 Days of Vegan Meals',
    description: 'Eat only plant-based meals for 10 days.',
    categoryName: 'Diet',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 30,
    rewardXp: 1000
  },
  {
    id: 'plastic-free-week',
    title: 'Plastic-Free Week',
    description: 'Avoid single-use plastics for an entire week.',
    categoryName: 'Waste',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 7,
    rewardXp: 500
  },
  {
    id: 'save-electricity',
    title: 'Save Electricity',
    description: 'Reduce energy consumption by turning off unused appliances.',
    categoryName: 'Energy',
    typeCode: 'COMMUNITY',
    progressType: 'AMOUNT',
    targetValue: 50,
    rewardXp: 700
  },
  {
    id: 'water-conservation',
    title: 'Water Conservation',
    description: 'Reduce water usage in daily activities.',
    categoryName: 'Water',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 10,
    rewardXp: 400
  },
  {
    id: 'zero-waste-week',
    title: 'Zero Waste Week',
    description: 'Produce zero non-recyclable waste for a week.',
    categoryName: 'Waste',
    typeCode: 'COMMUNITY',
    progressType: 'AMOUNT',
    targetValue: 10,
    rewardXp: 1200
  },
  {
    id: 'tree-plantation',
    title: 'Tree Plantation Drive',
    description: 'Plant trees to offset carbon emissions.',
    categoryName: 'Community',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 5,
    rewardXp: 1500
  },
  {
    id: 'carpool-challenge',
    title: 'Carpool Challenge',
    description: 'Share a ride with colleagues or friends.',
    categoryName: 'Transportation',
    typeCode: 'COMMUNITY',
    progressType: 'COUNT',
    targetValue: 10,
    rewardXp: 600
  }
];
