package com.ecotrack.security.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    @Test
    void testBcryptEncoding() {
        SecurityConfig config = new SecurityConfig(null, null, null, null, null);
        PasswordEncoder encoder = config.passwordEncoder();

        String rawPassword = "mySecretPassword123!";
        
        // Encode the same password twice
        String hash1 = encoder.encode(rawPassword);
        String hash2 = encoder.encode(rawPassword);

        System.out.println("Hash 1: " + hash1);
        System.out.println("Hash 2: " + hash2);

        // Verification: The hashes should be different (due to random salting)
        assertNotEquals(hash1, hash2, "BCrypt should generate different hashes for the same input due to salting");

        // Verification: Both hashes should successfully match the original password
        assertTrue(encoder.matches(rawPassword, hash1), "Hash 1 should match the raw password");
        assertTrue(encoder.matches(rawPassword, hash2), "Hash 2 should match the raw password");
    }
}
