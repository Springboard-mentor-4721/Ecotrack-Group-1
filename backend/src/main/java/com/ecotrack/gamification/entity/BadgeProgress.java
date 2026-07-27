package com.ecotrack.gamification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badge_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "badge_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "badge_id", nullable = false)
    private Long badgeId;

    @Column(name = "current_value", nullable = false)
    @Builder.Default
    private Integer currentValue = 0;

    @Column(name = "last_evaluated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime lastEvaluatedAt;
}
