import { Goal } from '../interfaces/goal.interface';

export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Reduce Monthly Electricity Usage',
    description: 'Cut down home electricity consumption by turning off appliances.',
    category: 'Electricity',
    status: 'In Progress',
    priority: 'High',
    currentValue: 350,
    targetValue: 300,
    measurementUnit: 'kWh',
    progressPercentage: 50, // Starts at something, maybe calculation is (current-target) ? Let's use simple logic
    createdDate: '2026-07-01',
    targetDate: '2026-07-31',
    progressHistory: [
      { id: 'ph1', date: '2026-07-05', value: 380, note: 'Initial baseline' },
      { id: 'ph2', date: '2026-07-15', value: 350, note: 'Switched to LEDs' }
    ],
    recentActivity: [
      'Updated progress on Jul 15',
      'Created goal on Jul 01'
    ]
  },
  {
    id: 'g2',
    title: 'Cycle to Work',
    description: 'Use bicycle for daily commute instead of car.',
    category: 'Transportation',
    status: 'Completed',
    priority: 'Medium',
    currentValue: 20,
    targetValue: 20,
    measurementUnit: 'days',
    progressPercentage: 100,
    createdDate: '2026-06-01',
    targetDate: '2026-06-30',
    progressHistory: [
      { id: 'ph3', date: '2026-06-15', value: 10, note: 'Halfway there' },
      { id: 'ph4', date: '2026-06-30', value: 20, note: 'Goal reached!' }
    ],
    recentActivity: [
      'Completed goal on Jun 30',
      'Updated progress on Jun 15'
    ]
  },
  {
    id: 'g3',
    title: 'Plant 10 Trees',
    description: 'Participate in local community tree planting events.',
    category: 'Plant Trees',
    status: 'In Progress',
    priority: 'High',
    currentValue: 4,
    targetValue: 10,
    measurementUnit: 'trees',
    progressPercentage: 40,
    createdDate: '2026-07-10',
    targetDate: '2026-12-31',
    progressHistory: [
      { id: 'ph5', date: '2026-07-18', value: 4, note: 'Planted 4 saplings' }
    ],
    recentActivity: [
      'Updated progress on Jul 18',
      'Created goal on Jul 10'
    ]
  },
  {
    id: 'g4',
    title: 'Zero Food Waste',
    description: 'Compost organic waste and plan meals better.',
    category: 'Waste',
    status: 'Pending',
    priority: 'Medium',
    currentValue: 0,
    targetValue: 100,
    measurementUnit: '%',
    progressPercentage: 0,
    createdDate: '2026-07-19',
    targetDate: '2026-08-31',
    progressHistory: [],
    recentActivity: [
      'Created goal on Jul 19'
    ]
  }
];
