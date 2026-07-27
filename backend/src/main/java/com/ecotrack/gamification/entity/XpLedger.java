package com.ecotrack.gamification.entity;

import com.ecotrack.gamification.enums.XpSourceType;
import com.ecotrack.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "xp_ledger")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XpLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "xp_awarded", nullable = false)
    private Integer xpAwarded;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 50)
    private XpSourceType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "awarded_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime awardedAt;
}
