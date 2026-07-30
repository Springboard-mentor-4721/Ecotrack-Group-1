package com.ecotrack.challenge.entity;

import com.ecotrack.challenge.enums.ChallengeStatus;
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

    @Column(name = "type_code", nullable = false, length = 30)
    private String typeCode;

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
    @Column(name = "progress_type", nullable = false, length = 20)
    @Builder.Default
    private com.ecotrack.challenge.enums.ProgressType progressType = com.ecotrack.challenge.enums.ProgressType.COUNT;

    @Column(name = "community_progress", nullable = false)
    @Builder.Default
    private java.math.BigDecimal communityProgress = java.math.BigDecimal.ZERO;
}
