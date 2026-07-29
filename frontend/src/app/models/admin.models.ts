import { PageableResponse } from './carbon.models';

export interface UserSummaryResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface UserDetailResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  bio?: string;
  location?: string;
  profilePictureUrl?: string;
  lifestylePreferences?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  oauthProvider?: string;
}

export interface UpdateUserStatusRequest {
  status: string;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
}

export type { AdminBadge, BadgeDefinitionRequest, GamificationConfig, ConfigUpdateRequest } from './gamification.models';
export type { ChallengeRequest } from './challenge.models';
