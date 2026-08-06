export interface LeaderboardEntry {
  userId: number;
  username: string;
  scoreValue: number;              // Long → number
  rank: number;
  status?: string;
  completedAt?: string | null;
}
