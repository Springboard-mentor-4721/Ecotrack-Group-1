export interface UserProfileResponse {
  userId: number;
  name: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  location?: string;
  lifestylePreferences?: string;
  fcmToken?: string;
  role?: string;
  status?: string;
  profileCreatedAt?: string;
}

export interface UpdateUserProfileRequest {
  bio?: string;
  location?: string;
  lifestylePreferences?: string;
  fcmToken?: string;
}
