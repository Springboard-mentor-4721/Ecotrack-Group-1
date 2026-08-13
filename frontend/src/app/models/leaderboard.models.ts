export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  scoreValue?: number; // XP
  metricValue?: number; // Eco Score or Challenge Progress
  rank: number;
  status?: string;
  completedAt?: string | null;
  exceededAverage?: boolean;
  currentDays?: number;
  level?: number;
  xpToNextRank?: number;
  profilePictureUrl?: string | null;
}
