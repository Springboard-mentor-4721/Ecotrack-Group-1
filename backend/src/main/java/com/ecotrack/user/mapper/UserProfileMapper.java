package com.ecotrack.user.mapper;

import com.ecotrack.user.dto.response.UserProfileResponse;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserProfileMapper {

    public UserProfileResponse toResponse(User user, UserProfile userProfile) {
        if (user == null || userProfile == null) {
            return null;
        }

        return UserProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(userProfile.getBio())
                .profilePictureUrl(userProfile.getProfilePictureUrl())
                .location(userProfile.getLocation())
                .lifestylePreferences(userProfile.getLifestylePreferences())
                .profileCreatedAt(userProfile.getCreatedAt())
                .profileUpdatedAt(userProfile.getUpdatedAt())
                .build();
    }
}
