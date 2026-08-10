package com.ecotrack.ai.cache;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insight_cache",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "insight_type", "reference_key"}))
public class AiInsightCache {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "insight_type", nullable = false, length = 32)
    private InsightType insightType;

    @Column(name = "reference_key", nullable = false, length = 64)
    private String referenceKey;

    @Column(name = "payload_json", nullable = false, columnDefinition = "json")
    private String payloadJson;

    @Column(name = "model_used", nullable = false, length = 64)
    private String modelUsed;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "generation_source", nullable = false)
    private GenerationSource generationSource;

    public enum InsightType {
        SMART_SUGGESTION, DAILY_TIP, TREND_PREDICTION, JOURNAL_SUMMARY, BEHAVIORAL_INSIGHT,
        AI_SUSTAINABILITY_INSIGHTS
    }

    public enum GenerationSource {
        SCHEDULED, LAZY, MANUAL
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public InsightType getInsightType() { return insightType; }
    public void setInsightType(InsightType insightType) { this.insightType = insightType; }
    public String getReferenceKey() { return referenceKey; }
    public void setReferenceKey(String referenceKey) { this.referenceKey = referenceKey; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public GenerationSource getGenerationSource() { return generationSource; }
    public void setGenerationSource(GenerationSource generationSource) { this.generationSource = generationSource; }
}
