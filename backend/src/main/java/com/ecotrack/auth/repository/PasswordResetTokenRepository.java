package com.ecotrack.auth.repository;

import com.ecotrack.auth.entity.PasswordResetToken;
import com.ecotrack.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUserAndUsedFalse(User user);
}
