export type BadgeRarity = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type XpSourceType = 'CARBON_ENTRY' | 'GOAL_COMPLETED' | 'CHALLENGE_COMPLETED' | 'STREAK_BONUS' | 'DAILY_LOGIN' | 'BADGE_BONUS';

export interface GamificationProfile {
  userId: number;
  currentEcoScore: number;         // BigDecimal → number
  lifetimeEcoXp: number;           // Long → number
  currentLevel: number;
  currentStreak: number;
  lastScoreUpdateAt: string;       // LocalDateTime → ISO string
}

export interface Badge {
  id: number;
  name: string;
  category: string;
  description: string;
  rarity: BadgeRarity;
  isEarned: boolean;
  awardedAt: string | null;        // null if not earned
}

export interface XpLedgerEntry {
  id: number;
  userId: number;
  xpAwarded: number;
  sourceType: XpSourceType;
  sourceId: number;
  awardedAt: string;
}

export interface AdminBadge {
  id: number;
  name: string;
  category: string;
  description: string;
  rarity: BadgeRarity;
  isHidden: boolean;
  isRepeatable: boolean;
  criteriaType: string;
  criteriaThreshold: number;
  createdAt: string;
}

export interface BadgeDefinitionRequest {
  name: string;                    // max 100 chars
  category: string;                // max 50 chars
  description: string;
  rarity: string;                  // max 20 chars
  isHidden: boolean;
  isRepeatable: boolean;
  criteriaType: string;            // max 50 chars
  criteriaThreshold: number;       // min 1
}
