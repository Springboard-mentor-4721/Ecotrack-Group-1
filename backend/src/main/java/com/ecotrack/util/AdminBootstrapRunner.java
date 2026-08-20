package com.ecotrack.util;

import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.repository.UserProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.gamification.service.GamificationProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final GamificationProfileService gamificationProfileService;
    private final PasswordEncoder passwordEncoder;

    @Value("${ecotrack.admin.initial-email:}")
    private String initialAdminEmail;

    @Value("${ecotrack.admin.initial-password:}")
    private String initialAdminPassword;

    @Value("${ecotrack.admin.initial-name:Admin}")
    private String initialAdminName;

    public AdminBootstrapRunner(UserRepository userRepository, 
                                UserProfileRepository userProfileRepository, 
                                GamificationProfileService gamificationProfileService, 
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.gamificationProfileService = gamificationProfileService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (initialAdminEmail == null || initialAdminEmail.trim().isEmpty() ||
            initialAdminPassword == null || initialAdminPassword.trim().isEmpty()) {
            logger.info("Admin bootstrap credentials not fully configured. Skipping admin bootstrap.");
            return;
        }

        if (userRepository.countByRole(Role.ADMIN) > 0) {
            logger.info("One or more admins already exist in the system. Skipping admin bootstrap.");
            return;
        }

        userRepository.findByEmail(initialAdminEmail).ifPresentOrElse(user -> {
            logger.info("User with configured initial admin email already exists but is not an admin. Skipping promotion to prevent accidental overwrite.");
        }, () -> {
            User admin = new User();
            admin.setName(initialAdminName);
            admin.setEmail(initialAdminEmail);
            admin.setPasswordHash(passwordEncoder.encode(initialAdminPassword));
            admin.setRole(Role.ADMIN);
            admin.setStatus(Status.ACTIVE);
            admin.setEmailVerified(true);
            admin.setOauthProvider(com.ecotrack.common.enums.OAuthProvider.LOCAL);

            admin = userRepository.save(admin);

            UserProfile userProfile = new UserProfile();
            userProfile.setUser(admin);
            userProfileRepository.save(userProfile);
            
            gamificationProfileService.createProfileForNewUser(admin.getId());

            logger.info("Successfully bootstrapped initial admin account: {}", initialAdminEmail);
        });
    }
}
