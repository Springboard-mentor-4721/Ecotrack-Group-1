package com.ecotrack.auth.service;

import com.ecotrack.auth.dto.AuthResponse;
import com.ecotrack.auth.dto.LoginRequest;
import com.ecotrack.auth.dto.RegisterRequest;
import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
import com.ecotrack.security.jwt.JwtService;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.entity.UserProfile;
import com.ecotrack.user.repository.UserProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.auth.dto.ForgotPasswordRequest;
import com.ecotrack.auth.dto.ResetPasswordRequest;
import com.ecotrack.auth.entity.PasswordResetToken;
import com.ecotrack.auth.repository.PasswordResetTokenRepository;
import com.ecotrack.common.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final UserProfileRepository userProfileRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Constructor injection
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.userProfileRepository = userProfileRepository;
    }

    // Register a new user
    @Transactional
    public void register(RegisterRequest request) {
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Create new user and map fields
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);

        // Set default values
        user.setRole(Role.USER);
        user.setStatus(Status.ACTIVE);
        user.setEmailVerified(false);
        user.setOauthProvider(com.ecotrack.common.enums.OAuthProvider.LOCAL);

        // Save user to database
        user = userRepository.save(user);

        // Create empty user profile
        UserProfile userProfile = new UserProfile();
        userProfile.setUser(user);
        userProfileRepository.save(userProfile);
    }

    // Authenticate a user and generate JWT
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == Status.SUSPENDED) {
            throw new DisabledException("Account suspended");
        }

        // Update login history
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, "Login successful");
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            return; // Silently return to prevent email enumeration
        }
        
        User user = userOpt.get();

        // Invalidate previous active tokens
        passwordResetTokenRepository.deleteByUserAndUsedFalse(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusMinutes(15)
        );

        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Password Reset Request", "Click the link to reset your password: " + resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired or already been used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
