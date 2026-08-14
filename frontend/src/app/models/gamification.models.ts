export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type XpSourceType = 'CARBON_ENTRY' | 'GOAL_COMPLETED' | 'CHALLENGE_COMPLETED' | 'STREAK_BONUS' | 'DAILY_LOGIN' | 'BADGE_BONUS';

export interface GamificationProfile {
  userId: number;
  currentEcoScore: number;         // BigDecimal → number
  currentEcoGrade?: string;
  lifetimeEcoXp: number;           // Long → number
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  currentLevelBaseXp?: number;
  nextLevelXp: number;
  totalBadges: number;
  earnedBadges: number;
  lastScoreUpdateAt: string;       // LocalDateTime → ISO string
}

export interface Badge {
  id: number;
  name: string;
  category: string;
  description: string;
  rarity: BadgeRarity;
  type: string;
  icon?: string;
  color?: string;
  isEarned: boolean;
  awardedAt: string | null;        // null if not earned
  criteriaType?: string;
  currentValue?: number;
  criteriaThreshold?: number;
  xpReward?: number;
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
  type: string;
  icon?: string;
  color?: string;
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
  type: string;
  icon?: string;
  color?: string;
  isHidden: boolean;
  isRepeatable: boolean;
  criteriaType?: string;            // max 50 chars, optional for challenges
  criteriaThreshold?: number;       // min 1, optional for challenges
}
