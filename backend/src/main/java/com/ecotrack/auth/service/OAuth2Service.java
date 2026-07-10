package com.ecotrack.auth.service;

import com.ecotrack.auth.dto.GoogleUserInfo;
import com.ecotrack.common.enums.OAuthProvider;
import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
import com.ecotrack.security.jwt.JwtService;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OAuth2Service {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public OAuth2Service(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public String processOAuth2User(GoogleUserInfo userInfo) {
        User user = userRepository.findByEmail(userInfo.email())
                .orElseGet(() -> {
                    // Create a new user if one doesn't exist
                    User newUser = new User();
                    newUser.setEmail(userInfo.email());
                    newUser.setName(userInfo.name());
                    newUser.setRole(Role.USER);
                    newUser.setStatus(Status.ACTIVE);
                    return newUser;
                });

        // Update provider and mapping rules
        if (user.getOauthProvider() == null) {
            user.setOauthProvider(OAuthProvider.GOOGLE);
            user.setOauthId(userInfo.googleId());
        } else if (user.getOauthProvider() == OAuthProvider.LOCAL && user.getOauthId() == null) {
            // Link account if it was LOCAL
            user.setOauthProvider(OAuthProvider.GOOGLE);
            user.setOauthId(userInfo.googleId());
        }
        
        // If it's already GOOGLE, we don't need to overwrite it, but we can update emailVerified
        if (userInfo.emailVerified()) {
            user.setEmailVerified(true);
        }

        user.setLastLoginAt(LocalDateTime.now());
        
        userRepository.save(user);

        return jwtService.generateToken(user);
    }
}
