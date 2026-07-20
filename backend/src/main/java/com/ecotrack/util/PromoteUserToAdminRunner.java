package com.ecotrack.util;

import com.ecotrack.common.enums.Role;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

/**
 * One‑off runner that promotes a specific e‑mail address to the ADMIN role.
 *
 * This class is safe to keep in the codebase – it will run on every application start,
 * but it only updates the user if the role is not already ADMIN. After you have verified
 * the promotion you may comment out or delete the bean.
 */
@Configuration
public class PromoteUserToAdminRunner {

    @Bean
    public CommandLineRunner promoteAdmin(UserRepository userRepository) {
        return args -> {
            String targetEmail = "admin@example.com"; // <<< change if you need a different address

            Optional<User> maybeUser = userRepository.findByEmail(targetEmail);
            if (maybeUser.isPresent()) {
                User user = maybeUser.get();
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    System.out.println("[EcoTrack] ✅ " + targetEmail + " promoted to ADMIN role.");
                } else {
                    System.out.println("[EcoTrack] ℹ️ " + targetEmail + " is already an ADMIN.");
                }
            } else {
                System.out.println("[EcoTrack] ❌ No user found with e‑mail: " + targetEmail);
            }
        };
    }
}
