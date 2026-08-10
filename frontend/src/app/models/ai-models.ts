export interface SmartSuggestionResponse {
  suggestionText: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
}

export interface JournalSummaryResponse {
  summaryText: string;
  highestEmissionCategory: string;
  mostImprovedCategory: string | null;
  overallProgress: 'IMPROVING' | 'WORSENING' | 'STABLE' | 'INSUFFICIENT_DATA';
  recommendations: string[];
}

export interface EcoTipResponse {
  tipText: string;
  relatedCategory: string | null;
}

export interface ForecastPoint {
  date: string;
  predictedCo2eKg: number;
}

export interface TrendPredictionResponse {
  forecast: ForecastPoint[];
  trendDirection: 'IMPROVING' | 'WORSENING' | 'STABLE';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  recommendation: string;
}

export interface BehavioralInsight {
  patternText: string;
  category: string;
  recommendation: string;
  impactWeight: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BehavioralInsightsResponse {
  insights: BehavioralInsight[];
}

export interface AiInsightsResponse {
  summary: string;
  trendExplanation: string;
  positiveObservations: string[];
  areasForImprovement: string[];
  recommendations: string[];
  generationSource: 'MANUAL' | 'SCHEDULED' | 'EVENT_DRIVEN';
}
