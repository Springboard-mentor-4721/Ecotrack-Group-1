export interface Recommendation {
  id: number;
  userId: number;
  category: string;
  recommendation: string;
  estimatedReductionKgco2e?: number; // Deprecated, ignore if present
  isRead: boolean;
  createdAt: string;
}
