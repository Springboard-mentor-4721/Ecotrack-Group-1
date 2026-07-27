package com.ecotrack.gamification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GamificationConfig {

    @Id
    @Column(name = "config_key", length = 50)
    private String configKey;

    @Column(name = "config_value", nullable = false)
    private String configValue;

    @Column(name = "value_type", nullable = false, length = 20)
    private String valueType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
