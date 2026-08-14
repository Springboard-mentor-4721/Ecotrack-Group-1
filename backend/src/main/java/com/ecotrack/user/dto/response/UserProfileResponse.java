package com.ecotrack.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long userId;
    private String name;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private String location;
    private String lifestylePreferences;
    private com.ecotrack.common.enums.Status status;
    private LocalDateTime profileCreatedAt;
    private LocalDateTime profileUpdatedAt;
    private java.util.List<String> interests;
}
