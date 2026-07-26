package com.ecotrack.admin.dto.response;

import com.ecotrack.common.enums.OAuthProvider;
import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
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
public class UserDetailResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private Status status;
    private boolean emailVerified;
    private OAuthProvider oauthProvider;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Profile details (may be null if profile doesn't exist)
    private String bio;
    private String profilePictureUrl;
    private String location;
    private String lifestylePreferences;
}
