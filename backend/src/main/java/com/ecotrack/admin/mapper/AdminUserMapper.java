package com.ecotrack.admin.mapper;

import com.ecotrack.admin.dto.response.UserDetailResponse;
import com.ecotrack.admin.dto.response.UserSummaryResponse;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {

    public UserSummaryResponse toSummaryResponse(User user) {
        if (user == null) return null;

        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    public UserDetailResponse toDetailResponse(User user, UserProfile profile) {
        if (user == null) return null;

        UserDetailResponse.UserDetailResponseBuilder builder = UserDetailResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .oauthProvider(user.getOauthProvider())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        if (profile != null) {
            builder.bio(profile.getBio())
                   .profilePictureUrl(profile.getProfilePictureUrl())
                   .location(profile.getLocation())
                   .lifestylePreferences(profile.getLifestylePreferences());
        }

        return builder.build();
    }
}
