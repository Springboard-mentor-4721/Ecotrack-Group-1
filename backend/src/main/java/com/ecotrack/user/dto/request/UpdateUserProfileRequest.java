package com.ecotrack.user.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @Size(max = 500, message = "Bio must be less than 500 characters")
    private String bio;

    @Size(max = 500, message = "Profile picture URL must be less than 500 characters")
    private String profilePictureUrl;

    @Size(max = 150, message = "Location must be less than 150 characters")
    private String location;

    private String lifestylePreferences;

    @Size(max = 255, message = "FCM token must be less than 255 characters")
    private String fcmToken;
}
