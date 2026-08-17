package com.ecotrack.util;

import com.ecotrack.common.enums.Role;
import com.ecotrack.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;

    @Value("${ecotrack.admin.initial-email:}")
    private String initialAdminEmail;

    public AdminBootstrapRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (initialAdminEmail == null || initialAdminEmail.trim().isEmpty()) {
            logger.info("No initial admin email configured (ecotrack.admin.initial-email). Skipping admin bootstrap.");
            return;
        }

        if (userRepository.countByRole(Role.ADMIN) > 0) {
            logger.info("One or more admins already exist in the system. Skipping admin bootstrap.");
            return;
        }

        userRepository.findByEmail(initialAdminEmail).ifPresentOrElse(user -> {
            user.setRole(Role.ADMIN);
            userRepository.save(user);
            logger.info("Successfully bootstrapped initial admin account: {}", initialAdminEmail);
        }, () -> {
            logger.warn("Configured initial admin email '{}' does not exist in the system. Cannot promote.", initialAdminEmail);
        });
    }
}
