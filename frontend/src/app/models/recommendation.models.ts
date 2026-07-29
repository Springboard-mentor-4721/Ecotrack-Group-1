export interface Recommendation {
  id: number;
  userId: number;
  category: string;
  recommendation: string;
  estimatedReductionKgco2e: number; // BigDecimal → number
  isRead: boolean;
  createdAt: string;
}
