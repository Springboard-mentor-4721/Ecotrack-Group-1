package com.ecotrack.gamification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_gamification_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGamificationProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "current_eco_score", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal currentEcoScore = BigDecimal.ZERO;

    @Column(name = "lifetime_eco_xp", nullable = false)
    @Builder.Default
    private Long lifetimeEcoXp = 0L;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "last_score_update_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime lastScoreUpdateAt;

    @Column(name = "monthly_score_snapshot", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal monthlyScoreSnapshot = BigDecimal.ZERO;

    @Column(name = "monthly_snapshot_month")
    private Integer monthlySnapshotMonth;

    @Column(name = "accumulated_decay", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal accumulatedDecay = BigDecimal.ZERO;
}
