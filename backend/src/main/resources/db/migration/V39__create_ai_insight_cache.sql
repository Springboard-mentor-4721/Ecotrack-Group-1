CREATE TABLE IF NOT EXISTS ai_insight_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    insight_type VARCHAR(32) NOT NULL,
    reference_key VARCHAR(64) NOT NULL,
    payload_json JSON NOT NULL,
    model_used VARCHAR(64) NOT NULL,
    generated_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    generation_source VARCHAR(255) NOT NULL,
    CONSTRAINT uq_ai_insight UNIQUE (user_id, insight_type, reference_key),
    KEY idx_ai_insight_lookup (user_id, insight_type, expires_at),
    CONSTRAINT fk_ai_insight_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
