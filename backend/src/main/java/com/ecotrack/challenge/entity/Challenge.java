package com.ecotrack.challenge.entity;

import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ChallengeStatus status = ChallengeStatus.PENDING;

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "linked_category_id")
    private Long linkedCategoryId;

    @Column(name = "reward_xp", nullable = false)
    @Builder.Default
    private Integer rewardXp = 500;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_metric", nullable = false, length = 30)
    @Builder.Default
    private com.ecotrack.challenge.enums.ProgressMetric progressMetric = com.ecotrack.challenge.enums.ProgressMetric.ENTRY_COUNT;

    @Column(name = "global_progress", nullable = false)
    @Builder.Default
    private java.math.BigDecimal globalProgress = java.math.BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_method", nullable = false, length = 20)
    @Builder.Default
    private TrackingMethod trackingMethod = TrackingMethod.MANUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "challenge_evaluation_type", nullable = false, length = 20)
    @Builder.Default
    private com.ecotrack.challenge.enums.ChallengeEvaluationType challengeEvaluationType = com.ecotrack.challenge.enums.ChallengeEvaluationType.ACHIEVEMENT;

    @Column(name = "rules_config", columnDefinition = "json")
    @Convert(converter = RulesConfigConverter.class)
    private RulesConfig rulesConfig;

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;
}
